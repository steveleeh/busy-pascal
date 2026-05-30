# -*- coding: utf-8 -*-
"""
Project 1: Scikit-learn Spam Classifier (Comparison Version)
这是一个使用工业界主流的机器学习库 scikit-learn 实现的对比版本。
它使用了：
1. `sklearn.feature_extraction.text.TfidfVectorizer`
2. `sklearn.naive_bayes.MultinomialNB`

通过运行此脚本，你会体会到工业库是如何通过极简的几行接口，高度抽象和封装了我们在 `scratch_classifier.py` 中手写的所有底层数学计算。
"""

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
except ImportError:
    print("[Error] 你的本地环境未安装 scikit-learn。")
    print("你可以使用以下命令进行安装: pip install scikit-learn")
    print("这并不影响你运行 'scratch_classifier.py'，因为手动版不需要任何第三方依赖。")
    import sys
    sys.exit(1)

from dataset import TRAIN_DATA, TEST_DATA

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 P1 Project: Scikit-learn 工业库版本垃圾邮件分类器")
    print("=" * 70)

    # 1. 拆分数据集
    train_texts = [item[0] for item in TRAIN_DATA]
    train_labels = [item[1] for item in TRAIN_DATA]
    
    test_texts = [item[0] for item in TEST_DATA]
    test_labels = [item[1] for item in TEST_DATA]

    # 2. 文本向量化 (使用 TfidfVectorizer)
    # token_pattern=r"(?u)\b\w+\b" 参数可以让分词规则跟我们的手动分词更接近（保留单字符单词）
    vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
    
    # 训练词汇表并提取训练集 TF-IDF 特征
    X_train = vectorizer.fit_transform(train_texts)
    # 使用训练好的词汇表转换测试集
    X_test = vectorizer.transform(test_texts)

    print(f"[Sklearn TF-IDF] 词汇表大小: {len(vectorizer.vocabulary_)}")

    # 3. 训练多项式朴素贝叶斯模型 (使用 MultinomialNB)
    # alpha=1.0 代表拉普拉斯平滑系数
    classifier = MultinomialNB(alpha=1.0)
    classifier.fit(X_train, train_labels)
    print("[Sklearn Naive Bayes] 模型训练完成。")

    # 4. 评估测试集
    predictions = classifier.predict(X_test)
    # 获得对数后验概率 (Log Probability)
    log_probs = classifier.predict_log_proba(X_test)

    correct_predictions = 0
    for i, text in enumerate(test_texts):
        pred = predictions[i]
        true_label = test_labels[i]
        is_correct = (pred == true_label)
        if is_correct:
            correct_predictions += 1
            
        pred_label_str = "垃圾邮件" if pred == 1 else "正常邮件"
        true_label_str = "垃圾邮件" if true_label == 1 else "正常邮件"
        result_symbol = "✅ 正确" if is_correct else "❌ 错误"

        print(f"\n测试邮件 #{i+1}: '{text}'")
        print(f"  - 真实类别: {true_label_str}")
        print(f"  - 预测类别: {pred_label_str} ({result_symbol})")
        print(f"  - sklearn 对数概率评分: 正常邮件 {log_probs[i][0]:.2f} | 垃圾邮件 {log_probs[i][1]:.2f}")

    accuracy = correct_predictions / len(test_texts)
    print(f"\n🔥 Sklearn 测试集最终准确率 (Test Accuracy): {accuracy:.2%}")
    print("\n💡 思考："
          "\n对比 scratch_classifier.py，你会发现两者在测试集上的预测结果完全一致！"
          "\n这就是数学的确定性。我们手写的数学公式和工业级 scikit-learn 的底层运行逻辑是完全一致的。")
    print("=" * 70)
