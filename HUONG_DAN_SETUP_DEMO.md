# Hướng dẫn Setup và Chạy Demo FixChain

## Tổng quan

Demo FixChain là một hệ thống tự động sửa lỗi code sử dụng SonarQube để phát hiện bugs và Dify AI để đề xuất sửa chữa. Hệ thống hỗ trợ 2 chế độ:
- **Không RAG**: Sử dụng AI trực tiếp để sửa bugs
- **Có RAG**: Sử dụng Retrieval-Augmented Generation với database kiến thức về bugs

## 1. Yêu cầu hệ thống

### Phần mềm cần thiết:
- Python 3.7+
- Docker và Docker Compose
- Windows PowerShell
- Git (tùy chọn)

### Tài khoản API:
- Dify Cloud API Key (hoặc Dify Local setup)
- SonarQube Token

### Tóm tắt thứ tự setup:
1. **Cài đặt Python dependencies** (`pip install -r requirements.txt`)
2. **Khởi động SonarQube** (`cd SonarQ && docker-compose up -d`)
3. **Khởi động FixChain services** (`cd FixChain && docker-compose up -d`)
4. **Cấu hình .env file** (API keys, tokens)
5. **Chạy demo** (`python run_demo.py --insert_rag --mode cloud`)

## 2. Cài đặt Dependencies

### Bước 1: Clone hoặc tải project
```bash
cd d:\ILA
```

### Bước 2: Cài đặt Python packages
```bash
cd FixChain
pip install -r requirements.txt
```

**Dependencies chính:**
- `langchain==0.2.16` - Framework cho LLM
- `chromadb==0.5.0` - Vector database cho RAG
- `fastapi==0.115.0` - Web framework
- `pymongo==4.6.0` - MongoDB driver
- `requests==2.32.3` - HTTP client
- `google-generativeai==0.3.2` - Google AI API

## 3. Setup Docker Services

### Bước 1: Setup SonarQube
```bash
cd d:\ILA\SonarQ
docker-compose up -d
```

Dịch vụ SonarQube sẽ chạy trên:
- **SonarQube Web**: http://localhost:9000
- **PostgreSQL**: localhost:5432

**Đăng nhập SonarQube:**
- Username: `admin`
- Password: `admin` (sẽ được yêu cầu đổi lần đầu)

### Bước 2: Tạo SonarQube Token
1. Truy cập http://localhost:9000
2. Đăng nhập với admin/admin
3. Vào **My Account** > **Security** > **Generate Tokens**
4. Tạo token mới và lưu lại

### Bước 3: Setup FixChain Services (MongoDB và RAG API)
```bash
cd d:\ILA\FixChain
docker-compose up -d
```

Dịch vụ FixChain sẽ chạy trên:
- **MongoDB**: localhost:27017
- **Mongo Express**: http://localhost:8081 (quản lý MongoDB)
- **RAG API Backend**: http://localhost:8000 (API cho RAG)

**Kiểm tra services đang chạy:**
```bash
docker ps
```

Bạn sẽ thấy các containers:
- `rag_mongodb` - MongoDB database
- `rag_mongo_express` - MongoDB web interface
- `rag_api_backend` - FixChain API backend

**Kiểm tra health của services:**
```bash
# Kiểm tra logs nếu có lỗi
docker-compose logs

# Kiểm tra logs của service cụ thể
docker-compose logs rag-api
docker-compose logs mongodb

# Test API backend
curl http://localhost:8000/health
```

## 4. Cấu hình môi trường

### Tạo file .env
Tạo hoặc chỉnh sửa file `d:\ILA\FixChain\.env`:

```env
# Dify API Configuration
DIFY_CLOUD_API_KEY=app-your-dify-cloud-api-key-here
DIFY_LOCAL_API_KEY=your-local-dify-key-here

# SonarQube Configuration
SONAR_HOST=http://localhost:9000
SONAR_TOKEN=sqa_your-sonarqube-token-here

# Project Configuration
PROJECT_KEY=my-service
SOURCE_CODE_PATH=d:\ILA\SonarQ\source_bug

# Execution Configuration
MAX_ITERATIONS=5

# MongoDB Configuration (cho RAG)
MONGODB_URL=mongodb://localhost:27017/rag_db
MONGODB_DATABASE=rag_db

# RAG Configuration
RAG_DATASET_PATH=d:\ILA\FixChain\lib\sample_rag_bugs.json

# Google Gemini AI (tùy chọn)
GEMINI_API_KEY=your-gemini-api-key-here
```

### Giải thích các biến quan trọng:

- **DIFY_CLOUD_API_KEY**: API key từ Dify Cloud (https://dify.ai)
- **SONAR_TOKEN**: Token từ SonarQube (tạo ở bước 3.2)
- **PROJECT_KEY**: Tên project trong SonarQube (phải khớp với sonar-project.properties)
- **SOURCE_CODE_PATH**: Đường dẫn đến source code cần scan
- **MAX_ITERATIONS**: Số lần lặp tối đa cho quy trình sửa lỗi

## 5. Setup Source Code để Scan

### Cấu trúc thư mục source_bug:
```
d:\ILA\SonarQ\source_bug\
├── code.py              # File code chính cần scan
├── code_1.py           # File sau lần sửa thứ 1
├── code_2.py           # File sau lần sửa thứ 2
└── sonar-project.properties  # Cấu hình SonarQube
```

### File sonar-project.properties:
```properties
sonar.projectKey=my-service
sonar.projectName=My Service
sonar.projectVersion=1.0
sonar.sources=.
sonar.language=py
sonar.sourceEncoding=UTF-8
```

### Ví dụ code.py có bugs:
File `d:\ILA\SonarQ\source_bug\code.py` đã có sẵn với các bugs phổ biến:
- SQL Injection
- Command Injection
- Hardcoded passwords
- Unused imports
- Security vulnerabilities

## 6. Chạy Demo

### Chế độ 1: Chạy KHÔNG có RAG

```bash
cd d:\ILA\FixChain

# Chạy với Dify Cloud (mặc định)
python run_demo.py --mode cloud

# Chạy với Dify Local
python run_demo.py --mode local
```

### Chế độ 2: Chạy CÓ RAG

```bash
cd d:\ILA\FixChain

# Chạy với RAG + Dify Cloud
python run_demo.py --insert_rag --mode cloud

# Chạy với RAG + Dify Local
python run_demo.py --insert_rag --mode local
```

### Tham số command line:
- `--insert_rag`: Bật chế độ RAG (tự động import dữ liệu RAG)
- `--mode {cloud,local}`: Chọn Dify Cloud hoặc Local
- `--help`: Xem trợ giúp

## 7. Quy trình hoạt động

### Bước 1: Khởi tạo
- Đọc cấu hình từ file .env
- Kiểm tra kết nối SonarQube và Dify
- Nếu có `--insert_rag`: Import dữ liệu RAG từ `sample_rag_bugs.json`

### Bước 2: Scan SonarQube
- Chạy sonar-scanner trên source code
- Export danh sách issues/bugs từ SonarQube API

### Bước 3: Sửa bugs với AI
- Gửi bugs và source code đến Dify AI
- Nếu có RAG: Tìm kiếm knowledge base trước khi sửa
- Nhận code đã được sửa từ AI

### Bước 4: Lưu kết quả
- Tạo file mới (code_1.py, code_2.py, ...)
- Backup file cũ với timestamp

### Bước 5: Lặp lại
- Scan lại file đã sửa
- Tiếp tục sửa nếu còn bugs
- Dừng khi không còn bugs hoặc đạt MAX_ITERATIONS

## 8. Kết quả và Output

### Console Output:
```
🚀 Running ExecutionService Demo
RAG functionality: Available
🔍 Running with RAG support (mode: cloud)...

==================================================
📊 EXECUTION RESULTS
==================================================
Mode: cloud
Project: my-service
Total bugs fixed: 15
Total iterations: 3
Duration: 45.67 seconds

  Iteration 1:
    Bugs found: 8
    Bugs fixed: 6
    Bugs failed: 2

  Iteration 2:
    Bugs found: 5
    Bugs fixed: 4
    Bugs failed: 1

  Iteration 3:
    Bugs found: 2
    Bugs fixed: 2
    Bugs failed: 0

✅ Demo completed successfully!
```

### Files được tạo:
- `code_1.py`: Code sau lần sửa đầu tiên
- `code_2.py`: Code sau lần sửa thứ hai
- `code_backup_YYYYMMDD_HHMMSS.py`: Backup files
- `logs/innolab_YYYY-MM-DD_HH-MM-SS.log`: Log files (unique cho mỗi lần chạy)

## 9. Troubleshooting

### Lỗi thường gặp:

#### 1. SonarQube connection failed
```
Error: Connection to SonarQube failed
```
**Giải pháp:**
- Kiểm tra SonarQube đang chạy: http://localhost:9000
- Verify SONAR_TOKEN trong .env
- Restart SonarQube: `docker-compose restart sonarqube`

#### 2. Dify API error
```
Error: Dify API request failed
```
**Giải pháp:**
- Kiểm tra DIFY_CLOUD_API_KEY hoặc DIFY_LOCAL_API_KEY
- Test API key trên Dify dashboard
- Kiểm tra network connection

#### 3. RAG functionality not available
```
Warning: RAG functionality not available
```
**Giải pháp:**
- Kiểm tra FixChain services đang chạy: `docker ps`
- Verify MONGODB_URL trong .env
- Restart FixChain services: `cd d:\ILA\FixChain && docker-compose restart`
- Kiểm tra logs: `docker-compose logs rag-api`

#### 5. Docker services không khởi động
```
Error: Cannot connect to Docker daemon
```
**Giải pháp:**
- Đảm bảo Docker Desktop đang chạy
- Restart Docker Desktop
- Kiểm tra port conflicts: `netstat -an | findstr :27017`
- Xóa containers cũ: `docker-compose down && docker-compose up -d`

#### 4. File not found
```
Error: Source code file not found
```
**Giải pháp:**
- Kiểm tra SOURCE_CODE_PATH trong .env
- Đảm bảo file code.py tồn tại
- Kiểm tra quyền đọc file

### Debug mode:
Bật debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 10. Mở rộng và Tùy chỉnh

### Thêm source code mới:
1. Copy file Python vào `d:\ILA\SonarQ\source_bug\`
2. Cập nhật `sonar-project.properties` nếu cần
3. Chạy demo như bình thường

### Tùy chỉnh RAG data:
1. Chỉnh sửa `lib/sample_rag_bugs.json`
2. Thêm bug patterns và solutions mới
3. Chạy với `--insert_rag` để import data mới

### Tích hợp với CI/CD:
```bash
# Script tự động
#!/bin/bash
cd d:\ILA\FixChain
python run_demo.py --insert_rag --mode cloud
if [ $? -eq 0 ]; then
    echo "Bug fixing completed successfully"
    # Deploy fixed code
else
    echo "Bug fixing failed"
    exit 1
fi
```

## 11. Kết luận

Demo FixChain cung cấp một giải pháp hoàn chỉnh cho việc tự động phát hiện và sửa lỗi code. Với khả năng tích hợp RAG, hệ thống có thể học hỏi từ các patterns bugs đã biết để đưa ra giải pháp tốt hơn.

**Lợi ích chính:**
- Tự động phát hiện bugs với SonarQube
- Sửa lỗi thông minh với AI
- Hỗ trợ RAG cho độ chính xác cao
- Dễ dàng tích hợp vào quy trình CI/CD
- Logging và tracking chi tiết

**Sử dụng trong thực tế:**
- Code review tự động
- Quality assurance
- Continuous improvement
- Training và education