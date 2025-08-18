# Kịch Bản Test Đánh Giá Hiệu Quả RAG trong Quét và Sửa Lỗi

## Tổng Quan

Dựa trên PBI và cấu trúc hệ thống ILA hiện tại, tài liệu này đưa ra các kịch bản test chi tiết để đánh giá hiệu quả của RAG (Retrieval-Augmented Generation) trong việc quét và sửa lỗi so với phương pháp không sử dụng RAG.

## 🎯 Mục Tiêu Test

1. **Đánh giá khả năng phân biệt bug thật và false positive**
2. **So sánh chất lượng gợi ý sửa lỗi**
3. **Đo lường chi phí token**
4. **Đánh giá chất lượng code sau khi sửa**

## 📊 Metrics Cần Thu Thập

### 1. Confusion Matrix Metrics
- **True Positive (TP)**: Bug thật được phát hiện đúng
- **True Negative (TN)**: False positive được phát hiện đúng
- **False Positive (FP)**: False positive bị nhận nhầm là bug thật
- **False Negative (FN)**: Bug thật bị bỏ sót

### 2. Performance Metrics
- **Precision**: TP / (TP + FP)
- **Recall**: TP / (TP + FN)
- **F1-Score**: 2 * (Precision * Recall) / (Precision + Recall)
- **Accuracy**: (TP + TN) / (TP + TN + FP + FN)

### 3. Cost Metrics
- **Token Usage**: Input tokens + Output tokens
- **API Call Cost**: Số lượng và chi phí các API calls
- **Processing Time**: Thời gian xử lý

### 4. Code Quality Metrics
- **SonarQube Score**: Trước và sau khi fix
- **Bug Density**: Số lỗi/1000 dòng code
- **Code Coverage**: Phần trăm code được test
- **Maintainability Index**: Chỉ số dễ bảo trì

## 🧪 Kịch Bản Test Chi Tiết

### **Scenario 1: Chuẩn Bị Dữ Liệu Test**

#### 1.1 Tạo Bug History Dataset
```bash
# Sử dụng sample data có sẵn
cd FixChain
python -c "
import json
with open('lib/sample_rag_bugs.json', 'r') as f:
    data = json.load(f)
print(f'Loaded {len(data[\"bugs\"])} sample bugs')
"
```

#### 1.2 Phân Loại Bug History
- **True Bugs**: 60% (bugs thật đã được confirm)
- **False Positives**: 25% (SonarQube báo nhầm)
- **Edge Cases**: 15% (khó phân biệt)

#### 1.3 Tạo Test Source Code
```bash
# Sử dụng source code mẫu trong SonarQ
cd SonarQ/source_bug
ls -la  # Kiểm tra code mẫu có sẵn
```

### **Scenario 2: Setup Môi Trường Test**

#### 2.1 Khởi Động Hệ Thống
```bash
# Terminal 1: FixChain Services
cd FixChain
docker-compose up -d

# Terminal 2: SonarQube
cd ../SonarQ
docker-compose up -d

# Đợi 3-5 phút để services khởi động
```

#### 2.2 Import Bug History vào RAG
```bash
# Import sample bugs làm RAG knowledge base
curl -X POST "http://localhost:8002/rag-bugs/import" \
  -H "Content-Type: application/json" \
  -d @lib/sample_rag_bugs.json
```

#### 2.3 Verify Setup
```bash
# Kiểm tra RAG stats
curl "http://localhost:8002/rag-bugs/stats"

# Kiểm tra SonarQube
curl "http://localhost:9000/api/system/status"
```

### **Scenario 3: Bug Detection Test**

#### 3.1 Scan Code với SonarQube
```bash
cd SonarQ

# Set token
$env:SONAR_TOKEN = "your_token_here"

# Scan project
docker run --rm \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_LOGIN="$env:SONAR_TOKEN" \
  -v "${PWD}:/usr/src" \
  sonarsource/sonar-scanner-cli:latest

# Export issues
python export_issues.py my-service
```

#### 3.2 Test LLM Without RAG
```python
# Script: test_llm_without_rag.py
import json
import requests
import google.generativeai as genai
from datetime import datetime

def evaluate_bug_without_rag(bug_data):
    """Đánh giá bug không sử dụng RAG"""
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    Analyze this bug report and determine:
    1. Is this a real bug or false positive?
    2. Severity level (LOW/MEDIUM/HIGH/CRITICAL)
    3. Confidence score (0-100%)
    
    Bug Information:
    {json.dumps(bug_data, indent=2)}
    
    Respond in JSON format:
    {{
        "is_real_bug": true/false,
        "severity": "HIGH",
        "confidence": 85,
        "reasoning": "explanation",
        "token_count": estimated_tokens
    }}
    """
    
    response = model.generate_content(prompt)
    return {
        "response": response.text,
        "timestamp": datetime.now().isoformat(),
        "method": "without_rag"
    }

# Load SonarQube issues
with open('issues_my-service.json', 'r') as f:
    issues = json.load(f)

results_without_rag = []
for issue in issues['issues'][:10]:  # Test first 10 issues
    result = evaluate_bug_without_rag(issue)
    results_without_rag.append(result)
    
# Save results
with open('results_without_rag.json', 'w') as f:
    json.dump(results_without_rag, f, indent=2)
```

#### 3.3 Test LLM With RAG
```python
# Script: test_llm_with_rag.py
import json
import requests
from datetime import datetime

def evaluate_bug_with_rag(bug_data):
    """Đánh giá bug sử dụng RAG"""
    
    # 1. Search similar bugs in RAG
    search_query = f"{bug_data['message']} {bug_data['rule_key']}"
    search_response = requests.post(
        "http://localhost:8002/rag-bugs/search",
        json={
            "query": search_query,
            "top_k": 3,
            "filters": {"bug_type": bug_data['type']}
        }
    )
    
    similar_bugs = search_response.json().get('results', [])
    
    # 2. Get AI suggestion with RAG context
    rag_context = "\n".join([
        f"Similar Bug: {bug['metadata']['bug_name']} - {bug['content'][:200]}..."
        for bug in similar_bugs
    ])
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    prompt = f"""
    Analyze this bug report using the context from similar bugs:
    
    CURRENT BUG:
    {json.dumps(bug_data, indent=2)}
    
    SIMILAR BUGS CONTEXT:
    {rag_context}
    
    Based on the similar bugs, determine:
    1. Is this a real bug or false positive?
    2. Severity level (LOW/MEDIUM/HIGH/CRITICAL)
    3. Confidence score (0-100%)
    
    Respond in JSON format:
    {{
        "is_real_bug": true/false,
        "severity": "HIGH",
        "confidence": 85,
        "reasoning": "explanation with reference to similar bugs",
        "similar_bugs_used": {len(similar_bugs)},
        "token_count": estimated_tokens
    }}
    """
    
    response = model.generate_content(prompt)
    return {
        "response": response.text,
        "similar_bugs": similar_bugs,
        "timestamp": datetime.now().isoformat(),
        "method": "with_rag"
    }

# Load SonarQube issues
with open('issues_my-service.json', 'r') as f:
    issues = json.load(f)

results_with_rag = []
for issue in issues['issues'][:10]:  # Test first 10 issues
    result = evaluate_bug_with_rag(issue)
    results_with_rag.append(result)
    
# Save results
with open('results_with_rag.json', 'w') as f:
    json.dump(results_with_rag, f, indent=2)
```

### **Scenario 4: Bug Fix Suggestion Test**

#### 4.1 Test Fix Suggestions Without RAG
```python
# Script: test_fix_without_rag.py
def suggest_fix_without_rag(bug_data):
    """Gợi ý fix không sử dụng RAG"""
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    Provide a fix suggestion for this bug:
    
    {json.dumps(bug_data, indent=2)}
    
    Provide:
    1. Root cause analysis
    2. Fix approach
    3. Code suggestion
    4. Testing recommendations
    
    Format as JSON:
    {{
        "root_cause": "analysis",
        "fix_approach": "approach",
        "code_suggestion": "code",
        "testing_recommendations": "tests",
        "estimated_effort": "time",
        "token_count": estimated_tokens
    }}
    """
    
    response = model.generate_content(prompt)
    return {
        "response": response.text,
        "timestamp": datetime.now().isoformat(),
        "method": "fix_without_rag"
    }
```

#### 4.2 Test Fix Suggestions With RAG
```python
# Script: test_fix_with_rag.py
def suggest_fix_with_rag(bug_id):
    """Gợi ý fix sử dụng RAG"""
    
    # Use RAG API for fix suggestion
    response = requests.post(
        "http://localhost:8002/rag-bugs/suggest-fix",
        json={
            "bug_id": bug_id,
            "include_similar_fixes": True
        }
    )
    
    return {
        "response": response.json(),
        "timestamp": datetime.now().isoformat(),
        "method": "fix_with_rag"
    }
```

### **Scenario 5: Code Quality Evaluation**

#### 5.1 Apply Fixes và Re-scan
```bash
# Script: apply_fixes_and_rescan.sh

# 1. Apply suggested fixes to source code
# (Manual step - apply fixes from both methods)

# 2. Re-scan with SonarQube
cd SonarQ
docker run --rm \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_LOGIN="$env:SONAR_TOKEN" \
  -v "${PWD}:/usr/src" \
  sonarsource/sonar-scanner-cli:latest

# 3. Export new results
python export_issues.py my-service-fixed

# 4. Compare results
python compare_results.py issues_my-service.json issues_my-service-fixed.json
```

#### 5.2 Measure Code Quality Improvements
```python
# Script: measure_quality_improvements.py
def calculate_quality_metrics(before_file, after_file):
    """Tính toán cải thiện chất lượng code"""
    
    with open(before_file, 'r') as f:
        before_data = json.load(f)
    
    with open(after_file, 'r') as f:
        after_data = json.load(f)
    
    before_issues = len(before_data['issues'])
    after_issues = len(after_data['issues'])
    
    improvement = {
        "issues_before": before_issues,
        "issues_after": after_issues,
        "issues_fixed": before_issues - after_issues,
        "improvement_percentage": ((before_issues - after_issues) / before_issues) * 100,
        "remaining_critical": len([i for i in after_data['issues'] if i['severity'] == 'CRITICAL']),
        "remaining_major": len([i for i in after_data['issues'] if i['severity'] == 'MAJOR'])
    }
    
    return improvement
```

## 📈 Kịch Bản Test Tự Động

### **Automated Test Suite**
```python
# Script: automated_rag_evaluation.py
import json
import time
import requests
from datetime import datetime
import pandas as pd

class RAGEvaluationSuite:
    def __init__(self):
        self.base_url = "http://localhost:8002"
        self.results = {
            "without_rag": [],
            "with_rag": [],
            "metrics": {}
        }
    
    def run_full_evaluation(self, test_issues):
        """Chạy đánh giá đầy đủ"""
        print("Starting RAG Evaluation Suite...")
        
        # 1. Test without RAG
        print("Testing without RAG...")
        for issue in test_issues:
            result = self.evaluate_without_rag(issue)
            self.results["without_rag"].append(result)
            time.sleep(1)  # Rate limiting
        
        # 2. Test with RAG
        print("Testing with RAG...")
        for issue in test_issues:
            result = self.evaluate_with_rag(issue)
            self.results["with_rag"].append(result)
            time.sleep(1)  # Rate limiting
        
        # 3. Calculate metrics
        self.calculate_comparison_metrics()
        
        # 4. Generate report
        self.generate_report()
        
        return self.results
    
    def calculate_comparison_metrics(self):
        """Tính toán metrics so sánh"""
        # Token usage comparison
        without_rag_tokens = sum([r.get('token_count', 0) for r in self.results["without_rag"]])
        with_rag_tokens = sum([r.get('token_count', 0) for r in self.results["with_rag"]])
        
        # Accuracy comparison (cần ground truth)
        # Confidence comparison
        without_rag_confidence = [r.get('confidence', 0) for r in self.results["without_rag"]]
        with_rag_confidence = [r.get('confidence', 0) for r in self.results["with_rag"]]
        
        self.results["metrics"] = {
            "token_usage": {
                "without_rag": without_rag_tokens,
                "with_rag": with_rag_tokens,
                "difference": with_rag_tokens - without_rag_tokens,
                "percentage_increase": ((with_rag_tokens - without_rag_tokens) / without_rag_tokens) * 100
            },
            "confidence": {
                "without_rag_avg": sum(without_rag_confidence) / len(without_rag_confidence),
                "with_rag_avg": sum(with_rag_confidence) / len(with_rag_confidence)
            }
        }
    
    def generate_report(self):
        """Tạo báo cáo so sánh"""
        report = {
            "evaluation_date": datetime.now().isoformat(),
            "test_cases": len(self.results["without_rag"]),
            "summary": self.results["metrics"],
            "detailed_results": self.results
        }
        
        with open(f'rag_evaluation_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"Report generated: rag_evaluation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")

# Usage
if __name__ == "__main__":
    # Load test issues
    with open('issues_my-service.json', 'r') as f:
        issues = json.load(f)['issues'][:20]  # Test 20 issues
    
    evaluator = RAGEvaluationSuite()
    results = evaluator.run_full_evaluation(issues)
```

## 📊 Expected Test Results Format

### **Confusion Matrix Results**
```json
{
  "without_rag": {
    "true_positive": 15,
    "true_negative": 8,
    "false_positive": 3,
    "false_negative": 2,
    "precision": 0.83,
    "recall": 0.88,
    "f1_score": 0.85,
    "accuracy": 0.82
  },
  "with_rag": {
    "true_positive": 18,
    "true_negative": 9,
    "false_positive": 1,
    "false_negative": 1,
    "precision": 0.95,
    "recall": 0.95,
    "f1_score": 0.95,
    "accuracy": 0.93
  }
}
```

### **Token Cost Analysis**
```json
{
  "token_costs": {
    "without_rag": {
      "total_tokens": 45000,
      "input_tokens": 15000,
      "output_tokens": 30000,
      "estimated_cost_usd": 0.68
    },
    "with_rag": {
      "total_tokens": 67000,
      "input_tokens": 28000,
      "output_tokens": 39000,
      "estimated_cost_usd": 1.02
    },
    "cost_increase_percentage": 50.0
  }
}
```

### **Code Quality Improvements**
```json
{
  "code_quality": {
    "without_rag_fixes": {
      "bugs_fixed": 12,
      "sonar_score_improvement": 15,
      "new_issues_introduced": 3
    },
    "with_rag_fixes": {
      "bugs_fixed": 16,
      "sonar_score_improvement": 25,
      "new_issues_introduced": 1
    }
  }
}
```

## 🎯 Success Criteria

### **RAG được coi là hiệu quả nếu:**

1. **Accuracy Improvement**: F1-score tăng ít nhất 10%
2. **False Positive Reduction**: Giảm ít nhất 20% false positives
3. **Fix Quality**: Code quality score tăng ít nhất 15%
4. **Cost Efficiency**: Chi phí token tăng không quá 60% nhưng chất lượng tăng đáng kể

### **Các Trường Hợp RAG Hữu Ích:**
- Complex bugs với nhiều context
- Security vulnerabilities
- Performance issues
- Bugs có pattern tương tự trong lịch sử

### **Các Trường Hợp RAG Không Cần Thiết:**
- Simple code smells
- Obvious syntax errors
- Standard coding convention violations

## 🚀 Execution Plan

### **Week 1: Setup & Data Preparation**
- Setup môi trường test
- Chuẩn bị bug history dataset
- Tạo ground truth labels

### **Week 2: Bug Detection Testing**
- Chạy test scenarios 2-3
- Thu thập confusion matrix data
- Phân tích token costs

### **Week 3: Fix Suggestion Testing**
- Chạy test scenario 4
- Apply fixes và measure quality
- So sánh code quality improvements

### **Week 4: Analysis & Reporting**
- Tổng hợp kết quả
- Tạo báo cáo chi tiết
- Đưa ra recommendations

Tài liệu này cung cấp framework đầy đủ để đánh giá hiệu quả của RAG trong việc quét và sửa lỗi, đảm bảo có được bằng chứng cụ thể về giá trị của RAG thông qua các metrics định lượng.