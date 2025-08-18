# RAG Evaluation Test Scripts

Bộ script tự động để đánh giá hiệu quả của RAG trong việc quét và sửa lỗi, so sánh với phương pháp không sử dụng RAG.

## 📁 Cấu trúc Files

```
test_scripts/
├── automated_rag_evaluation.py      # Đánh giá khả năng phát hiện bug
├── fix_suggestion_evaluator.py      # Đánh giá chất lượng gợi ý sửa lỗi
├── code_quality_analyzer.py         # Đánh giá chất lượng code sau fix
├── comprehensive_rag_evaluation.py  # Script tổng hợp chạy toàn bộ quy trình
└── README.md                        # Hướng dẫn này
```

## 🎯 Mục tiêu Đánh giá

### 1. Bug Detection Accuracy
- So sánh khả năng phân biệt bug thật vs false positive
- Đo lường độ chính xác, recall, precision
- Tạo confusion matrix

### 2. Fix Suggestion Quality
- Đánh giá chất lượng gợi ý sửa lỗi
- So sánh confidence score
- Đo lường token usage efficiency

### 3. Code Quality Improvement
- Đánh giá chất lượng code sau khi apply fixes
- So sánh metrics từ SonarQube
- Đo lường improvement percentage

## 🔧 Yêu cầu Hệ thống

### Services cần chạy:
- **MongoDB** (port 27017)
- **FixChain RAG API** (port 8002)
- **SonarQube** (port 9000)

### Dependencies:
```bash
pip install requests pymongo google-generativeai python-dotenv
```

### Environment Variables:
```bash
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017
```

## 🚀 Cách sử dụng

### Option 1: Chạy Comprehensive Evaluation (Khuyến nghị)

```bash
# Chạy toàn bộ quy trình đánh giá
python comprehensive_rag_evaluation.py \
    --source-dir "d:/ILA/sample_project" \
    --max-bugs 10 \
    --sonar-token "your_sonar_token"
```

**Tham số:**
- `--source-dir`: Thư mục source code cần phân tích
- `--max-bugs`: Số lượng bugs tối đa để test (default: 10)
- `--fixchain-url`: URL của FixChain API (default: http://localhost:8002)
- `--sonar-url`: URL của SonarQube (default: http://localhost:9000)
- `--sonar-token`: Token xác thực SonarQube
- `--issues-file`: File issues có sẵn (nếu không muốn scan lại)

### Option 2: Chạy từng Phase riêng biệt

#### Phase 1: Bug Detection Evaluation
```bash
python automated_rag_evaluation.py
```

#### Phase 2: Fix Suggestion Evaluation
```bash
python fix_suggestion_evaluator.py
```

#### Phase 3: Code Quality Analysis
```bash
python code_quality_analyzer.py
```

## 📊 Kết quả Output

### 1. Comprehensive Evaluation
- `comprehensive_rag_evaluation_YYYYMMDD_HHMMSS.json`: Báo cáo chi tiết
- `rag_evaluation_summary_YYYYMMDD_HHMMSS.md`: Tóm tắt dễ đọc

### 2. Individual Phase Results
- `rag_evaluation_YYYYMMDD_HHMMSS.json`: Kết quả bug detection
- `fix_suggestion_evaluation_YYYYMMDD_HHMMSS.json`: Kết quả fix suggestions
- `code_quality_analysis_YYYYMMDD_HHMMSS.json`: Kết quả code quality

## 📈 Metrics được đo lường

### Bug Detection Metrics
```json
{
  "confusion_matrix": {
    "without_rag": {"tp": 8, "fp": 3, "tn": 7, "fn": 2},
    "with_rag": {"tp": 9, "fp": 2, "tn": 8, "fn": 1}
  },
  "accuracy": {
    "without_rag": 0.75,
    "with_rag": 0.85
  },
  "precision": {
    "without_rag": 0.73,
    "with_rag": 0.82
  }
}
```

### Fix Suggestion Metrics
```json
{
  "token_usage": {
    "without_rag": 15000,
    "with_rag": 18000,
    "percentage_increase": 20.0
  },
  "confidence_scores": {
    "without_rag_avg": 78.5,
    "with_rag_avg": 85.2
  },
  "fix_quality_scores": {
    "without_rag_avg": 7.2,
    "with_rag_avg": 8.1
  }
}
```

### Code Quality Metrics
```json
{
  "quality_scores": {
    "baseline": 72.3,
    "without_rag": 75.1,
    "with_rag": 78.9
  },
  "bugs_fixed": {
    "without_rag": 15,
    "with_rag": 22
  }
}
```

## 🎯 RAG Effectiveness Score

Script tính toán điểm hiệu quả tổng thể (0-100):

- **Bug Detection** (0-25 điểm): Cải thiện độ chính xác
- **Fix Quality** (0-25 điểm): Chất lượng gợi ý sửa lỗi
- **Token Efficiency** (0-25 điểm): Hiệu quả sử dụng token
- **Code Quality** (0-25 điểm): Cải thiện chất lượng code

### Thang đánh giá:
- **80-100**: RAG cải thiện đáng kể
- **60-79**: RAG cải thiện vừa phải
- **40-59**: RAG cải thiện hạn chế
- **0-39**: RAG không cải thiện đáng kể

## 🔍 Ví dụ Workflow

### 1. Chuẩn bị
```bash
# Khởi động các services
docker-compose up -d mongodb
cd FixChain && python controller/rag_bug_controller.py
docker run -d --name sonarqube -p 9000:9000 sonarqube:community

# Set environment variables
export GEMINI_API_KEY="your_api_key"
```

### 2. Chạy đánh giá
```bash
cd test_scripts
python comprehensive_rag_evaluation.py \
    --source-dir "../sample_project" \
    --max-bugs 15 \
    --sonar-token "squ_your_token"
```

### 3. Xem kết quả
```bash
# Xem tóm tắt
cat rag_evaluation_summary_*.md

# Xem chi tiết
cat comprehensive_rag_evaluation_*.json | jq '.final_comparison'
```

## 🛠️ Customization

### Thêm Ground Truth Data
Sửa file `automated_rag_evaluation.py`:
```python
def create_ground_truth(self, issues):
    # Thêm logic để tạo ground truth
    # Ví dụ: đọc từ file CSV có sẵn
    ground_truth = {}
    for issue in issues:
        # Logic phân loại bug thật vs false positive
        ground_truth[issue['key']] = 'true_bug'  # hoặc 'false_positive'
    return ground_truth
```

### Thêm Custom Metrics
Sửa file `code_quality_analyzer.py`:
```python
def calculate_custom_metrics(self, baseline, after_fix):
    # Thêm metrics tùy chỉnh
    custom_metrics = {
        'technical_debt_reduction': self.calculate_tech_debt(baseline, after_fix),
        'security_improvement': self.calculate_security_score(baseline, after_fix)
    }
    return custom_metrics
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **MongoDB connection failed**
   ```bash
   # Kiểm tra MongoDB đang chạy
   docker ps | grep mongo
   # Hoặc
   systemctl status mongod
   ```

2. **FixChain API not responding**
   ```bash
   # Kiểm tra API
   curl http://localhost:8002/health
   ```

3. **SonarQube scan failed**
   ```bash
   # Kiểm tra sonar-scanner installed
   sonar-scanner --version
   # Kiểm tra project properties
   cat sonar-project.properties
   ```

4. **Gemini API quota exceeded**
   ```bash
   # Giảm số bugs test
   python comprehensive_rag_evaluation.py --max-bugs 5
   ```

## 📝 Notes

- Script sử dụng **Gemini 2.0 Flash** cho AI evaluation
- Kết quả được lưu với timestamp để tránh ghi đè
- Code quality analysis yêu cầu **sonar-scanner** CLI
- RAG evaluation cần **MongoDB** để lưu trữ bug history
- Token usage được estimate, không phải số chính xác

## 🤝 Contributing

Để cải thiện script:
1. Fork repository
2. Tạo feature branch
3. Thêm tests cho new features
4. Submit pull request

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.