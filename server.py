from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import Response
from datetime import datetime, timedelta
import bcrypt
import json
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "data"
CONFIG_FILE = "config.json"
SESSION_COOKIE_NAME = "session_id"
SESSION_EXPIRE_HOURS = 8
LOGIN_ATTEMPT_LIMIT = 5
LOCKOUT_DURATION_MINUTES = 1

login_attempts = {}
sessions = {}

os.makedirs(DATA_DIR, exist_ok=True)

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

def generate_session_id():
    return str(uuid.uuid4())

def get_client_ip(request: Request):
    return request.client.host

def check_session(request: Request):
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if session_id in sessions:
        if sessions[session_id]['expire'] > datetime.now():
            sessions[session_id]['expire'] = datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS)
            return True
        else:
            del sessions[session_id]
    return False

@app.get("/api/check-first-time")
async def check_first_time():
    config = load_config()
    return {"is_first_time": not ('login_password_hash' in config and 'admin_password_hash' in config)}

@app.post("/api/setup")
async def setup(data: dict):
    config = load_config()
    if 'login_password_hash' in config:
        raise HTTPException(status_code=400, detail="Already set up")
    
    login_password = data.get('loginPassword')
    admin_password = data.get('adminPassword')
    
    if not login_password or not admin_password:
        raise HTTPException(status_code=400, detail="Both passwords required")
    
    login_hash = bcrypt.hashpw(login_password.encode(), bcrypt.gensalt()).decode()
    admin_hash = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    
    config['login_password_hash'] = login_hash
    config['admin_password_hash'] = admin_hash
    save_config(config)
    
    return {"message": "Setup successful"}

@app.post("/api/login")
async def login(data: dict, request: Request, response: Response):
    ip = get_client_ip(request)
    
    if ip in login_attempts:
        if login_attempts[ip]['locked_until'] > datetime.now():
            raise HTTPException(status_code=423, detail="Account locked. Try again later.")
    
    config = load_config()
    if 'login_password_hash' not in config:
        raise HTTPException(status_code=400, detail="Not set up yet")
    
    password = data.get('password', '')
    stored_hash = config['login_password_hash']
    
    if bcrypt.checkpw(password.encode(), stored_hash.encode()):
        if ip in login_attempts:
            del login_attempts[ip]
        
        session_id = generate_session_id()
        sessions[session_id] = {
            'expire': datetime.now() + timedelta(hours=SESSION_EXPIRE_HOURS),
            'ip': ip
        }
        
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=SESSION_EXPIRE_HOURS * 3600
        )
        
        return {"message": "Login successful"}
    else:
        if ip not in login_attempts:
            login_attempts[ip] = {'count': 0, 'locked_until': datetime.now()}
        
        login_attempts[ip]['count'] += 1
        
        if login_attempts[ip]['count'] >= LOGIN_ATTEMPT_LIMIT:
            login_attempts[ip]['locked_until'] = datetime.now() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            raise HTTPException(status_code=423, detail="Account locked. Try again later.")
        
        raise HTTPException(status_code=401, detail="Invalid password")

@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {"message": "Logout successful"}

@app.get("/api/check-auth")
async def check_auth(request: Request):
    if check_session(request):
        return {"authenticated": True}
    raise HTTPException(status_code=401, detail="Not authenticated")

@app.post("/api/change-password")
async def change_password(data: dict, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    config = load_config()
    admin_password = data.get('adminPassword', '')
    new_password = data.get('newPassword', '')
    
    if not bcrypt.checkpw(admin_password.encode(), config['admin_password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Invalid admin password")
    
    if not new_password:
        raise HTTPException(status_code=400, detail="New password required")
    
    config['login_password_hash'] = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    save_config(config)
    
    return {"message": "Password changed successfully"}

@app.get("/api/opportunities")
async def get_opportunities(request: Request, status: str = ''):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    opportunities = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(DATA_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    opp = json.load(f)
                    if not status or opp.get('status') == status:
                        opportunities.append(opp)
            except:
                pass
    
    opportunities.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return opportunities

@app.post("/api/opportunities")
async def create_opportunity(data: dict, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    name = data.get('name', 'Untitled')
    opp = {
        'id': str(uuid.uuid4()),
        'name': name,
        'status': 'active',
        'nodes': [],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    filepath = os.path.join(DATA_DIR, f"{opp['id']}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    return opp

@app.get("/api/opportunities/{id}")
async def get_opportunity(id: str, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.post("/api/opportunities/{id}/update")
async def update_opportunity(id: str, data: dict, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        opp = json.load(f)
    
    if 'name' in data:
        opp['name'] = data['name']
    opp['updated_at'] = datetime.now().isoformat()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    return opp

@app.post("/api/opportunities/{id}/delete")
async def delete_opportunity(id: str, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    os.remove(filepath)
    return {"message": "Deleted successfully"}

@app.post("/api/opportunities/{id}/archive")
async def archive_opportunity(id: str, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        opp = json.load(f)
    
    opp['status'] = 'archived'
    opp['updated_at'] = datetime.now().isoformat()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    return opp

@app.post("/api/opportunities/{id}/unarchive")
async def unarchive_opportunity(id: str, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        opp = json.load(f)
    
    opp['status'] = 'active'
    opp['updated_at'] = datetime.now().isoformat()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    return opp

@app.post("/api/opportunities/{opp_id}/nodes/create")
async def create_node(opp_id: str, data: dict, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{opp_id}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        opp = json.load(f)
    
    node = {
        'id': str(uuid.uuid4()),
        'opportunity_id': opp_id,
        'title': data.get('title', ''),
        'assignee': data.get('assignee', ''),
        'department': data.get('department', ''),
        'description': data.get('description', ''),
        'status': data.get('status', '待办'),
        'acceptance_criteria': data.get('acceptance_criteria', ''),
        'start_date': data.get('start_date', ''),
        'due_date': data.get('due_date', ''),
        'risk': data.get('risk', ''),
        'notes': data.get('notes', ''),
        'is_smart': data.get('is_smart', False),
        'smart_s': data.get('smart_s', ''),
        'smart_m': data.get('smart_m', ''),
        'smart_a': data.get('smart_a', ''),
        'smart_r': data.get('smart_r', ''),
        'smart_t': data.get('smart_t', ''),
        'parent_relations': data.get('parent_relations', []),
        'sequence': len(opp['nodes']) + 1,
        'position_x': 100 + (len(opp['nodes']) % 3) * 250,
        'position_y': 100 + (len(opp['nodes']) // 3) * 180,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    opp['nodes'].append(node)
    opp['updated_at'] = datetime.now().isoformat()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    return node

@app.post("/api/nodes/{id}/update")
async def update_node(id: str, data: dict, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    found = False
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(DATA_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    opp = json.load(f)
                
                for node in opp['nodes']:
                    if node['id'] == id:
                        if 'title' in data: node['title'] = data['title']
                        if 'assignee' in data: node['assignee'] = data['assignee']
                        if 'deadline' in data: node['deadline'] = data['deadline']
                        if 'status' in data: node['status'] = data['status']
                        if 'notes' in data: node['notes'] = data['notes']
                        if 'is_smart' in data: node['is_smart'] = data['is_smart']
                        if 'smart_s' in data: node['smart_s'] = data['smart_s']
                        if 'smart_m' in data: node['smart_m'] = data['smart_m']
                        if 'smart_a' in data: node['smart_a'] = data['smart_a']
                        if 'smart_r' in data: node['smart_r'] = data['smart_r']
                        if 'smart_t' in data: node['smart_t'] = data['smart_t']
                        if 'position_x' in data: node['position_x'] = data['position_x']
                        if 'position_y' in data: node['position_y'] = data['position_y']
                        if 'parent_ids' in data: node['parent_ids'] = data['parent_ids']
                        if 'parent_relations' in data: node['parent_relations'] = data['parent_relations']
                        node['updated_at'] = datetime.now().isoformat()
                        opp['updated_at'] = datetime.now().isoformat()
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(opp, f, indent=2)
                        
                        found = True
                        return node
            except:
                pass
    
    if not found:
        raise HTTPException(status_code=404, detail="Node not found")

@app.post("/api/opportunities/{id}/save-all")
async def save_all_nodes(id: str, data: dict, request: Request):
    print(f"[SERVER] 接收到全量保存请求, opportunityId: {id}")
    if not check_session(request):
        print(f"[SERVER] 未认证")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    filepath = os.path.join(DATA_DIR, f"{id}.json")
    if not os.path.exists(filepath):
        print(f"[SERVER] 商机不存在: {filepath}")
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        opp = json.load(f)
    
    if 'nodes' in data:
        node_count = len(data['nodes'])
        print(f"[SERVER] 正在保存 {node_count} 个节点")
        opp['nodes'] = data['nodes']
    else:
        print(f"[SERVER] 数据中没有 nodes 字段")
    
    opp['updated_at'] = datetime.now().isoformat()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(opp, f, indent=2)
    
    print(f"[SERVER] 保存成功")
    return opp

@app.post("/api/nodes/{id}/delete")
async def delete_node(id: str, request: Request):
    if not check_session(request):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    found = False
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(DATA_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    opp = json.load(f)
                
                initial_count = len(opp['nodes'])
                opp['nodes'] = [n for n in opp['nodes'] if n['id'] != id]
                
                if len(opp['nodes']) < initial_count:
                    opp['updated_at'] = datetime.now().isoformat()
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(opp, f, indent=2)
                    
                    found = True
                    return {"message": "Deleted successfully"}
            except:
                pass
    
    if not found:
        raise HTTPException(status_code=404, detail="Node not found")

app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
