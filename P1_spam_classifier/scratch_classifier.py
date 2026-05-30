# -*- coding: utf-8 -*-
"""
Project 1: Scratch TF-IDF and Naive Bayes Classifier
这个脚本完全从零（不使用任何第三方库，只用 Python 标准库）实现了：
1. TF-IDF 文本向量化器 (TF-IDF Vectorizer)
2. 多项式朴素贝叶斯分类器 (Multinomial Naive Bayes Classifier)

通过极具可读性的代码与详尽的数学原理解释，带你一窥大语言模型诞生前，NLP 最经典、最高效的分类系统。
"""

import math
from dataset import TRAIN_DATA, TEST_DATA, clean_text

class ScratchTFIDFVectorizer:
    """
    从零实现 TF-IDF 向量化器 (TF-IDF Vectorizer from scratch)
    用于将变长的“文本列表”转化为固定维度的“高维数值特征矩阵”。
    """
    def __init__(self):
        self.vocabulary_ = {}    # 词汇表: {单词: 索引} (Word to index map)
        self.idf_ = {}           # 每个单词的 IDF 值 (Inverse Document Frequency map)
        self.feature_names_ = [] # 词汇列表（索引对应单词） (Index to word list)

    def fit(self, raw_documents):
        """
        构建词汇表并计算每个单词的 IDF 值。
        IDF(t) = ln((1 + N) / (1 + DF(t))) + 1  (使用平滑，防止分母为 0)
        """
        # 1. 对所有文档进行分词清洗
        tokenized_docs = [clean_text(doc) for doc in raw_documents]
        N = len(tokenized_docs)  # 文档总数

        # 2. 收集所有不重复的单词，建立词汇表
        unique_words = sorted(list(set(word for doc in tokenized_docs for word in doc)))
        self.vocabulary_ = {word: i for i, word in enumerate(unique_words)}
        self.feature_names_ = unique_words

        # 3. 计算每个单词的文档频率 DF (Document Frequency - 包含该词的文档数)
        df = {word: 0 for word in unique_words}
        for doc in tokenized_docs:
            doc_set = set(doc)  # 去重，只算“是否出现”
            for word in doc_set:
                df[word] += 1

        # 4. 计算每个单词的 IDF 值 (添加 +1 平滑项，和 sklearn 实现一致)
        for word in unique_words:
            # 经典的平滑 IDF 公式
            self.idf_[word] = math.log((1 + N) / (1 + df[word])) + 1.0

        print(f"[TF-IDF] Fit completed. Vocabulary size: {len(self.vocabulary_)}")
        return self

    def transform(self, raw_documents):
        """
        将文档列表转化为 TF-IDF 浮点数矩阵。
        返回格式: List[List[float]]，形状为 [文档数, 词汇表大小]
        """
        tokenized_docs = [clean_text(doc) for doc in raw_documents]
        matrix = []

        for doc in tokenized_docs:
            doc_len = len(doc)
            # 如果是空文档，为了防止除以 0，设长度为 1
            if doc_len == 0:
                doc_len = 1

            # 计算该文档内单词的出现频数
            word_counts = {}
            for word in doc:
                word_counts[word] = word_counts.get(word, 0) + 1

            # 初始化一个全 0 向量，维度等于词汇表大小
            vector = [0.0] * len(self.vocabulary_)

            # 计算 TF 并乘上 IDF，填充向量
            for word, count in word_counts.items():
                if word in self.vocabulary_:
                    idx = self.vocabulary_[word]
                    tf = count / doc_len  # Term Frequency (词频)
                    idf = self.idf_[word] # Inverse Document Frequency (逆文档频率)
                    vector[idx] = tf * idf

            # (可选) 对向量进行 L2 归一化，消除文档长度对向量绝对值大小的影响
            # 这也是 sklearn 的默认行为，可以让长文档和短文档处于同一尺度
            l2_norm = math.sqrt(sum(v**2 for v in vector))
            if l2_norm > 0:
                vector = [v / l2_norm for v in vector]

            matrix.append(vector)

        return matrix

    def fit_transform(self, raw_documents):
        self.fit(raw_documents)
        return self.transform(raw_documents)


class ScratchNaiveBayesClassifier:
    """
    从零实现多项式朴素贝叶斯分类器 (Multinomial Naive Bayes Classifier from scratch)
    基于贝叶斯定理预测类别概率：
    P(Class | Features) = P(Class) * P(Features | Class) / P(Features)
    因为分母 P(Features) 对所有类别都一样，我们只需要求分子最大值：
    P(c|x) ∝ P(c) * ∏ P(x_j | c)
    """
    def __init__(self, alpha=1.0):
        self.alpha = alpha  # 拉普拉斯平滑系数 (Laplace smoothing parameter)
        self.class_priors_ = {} # 类别的先验概率 P(c)
        self.feature_log_prob_ = {} # 每个类别下特征的对数条件概率 log P(w_j | c)
        self.classes_ = []  # 类别列表 (如 [0, 1])

    def fit(self, X, y):
        """
        训练模型：计算先验概率和条件概率。
        X: TF-IDF 矩阵 (List[List[float]])
        y: 标签列表 (List[int])
        """
        n_samples = len(X)
        n_features = len(X[0])
        self.classes_ = list(set(y))

        # 1. 计算类别先验概率 P(c)
        # P(c) = 该类样本数 / 总样本数
        for c in self.classes_:
            class_count = sum(1 for label in y if label == c)
            self.class_priors_[c] = class_count / n_samples

        # 2. 计算每个类别下每个单词特征的条件概率 P(w_j | c)
        # 在多项式贝叶斯中，如果有 TF-IDF，我们把 TF-IDF 值视为“加权词频”。
        # P(w_j | c) = (类别 c 下单词 j 的 TF-IDF 总和 + alpha) / (类别 c 下所有单词的 TF-IDF 总和 + alpha * 词表大小)
        for c in self.classes_:
            # 筛选出属于类别 c 的所有样本的 TF-IDF 向量
            class_samples = [X[i] for i in range(n_samples) if y[i] == c]
            
            # 计算类别 c 下，每个特征词的 TF-IDF 累加和
            feature_sums = [sum(sample[j] for sample in class_samples) for j in range(n_features)]
            
            # 类别 c 下，所有特征的总累加和
            total_sum = sum(feature_sums)

            # 计算对数条件概率 log P(w_j | c)，使用 log 防止数值下溢
            # log(A / B) = log A - log B
            self.feature_log_prob_[c] = []
            for feat_sum in feature_sums:
                # 应用拉普拉斯平滑 (Laplace Smoothing)
                smoothed_numerator = feat_sum + self.alpha
                smoothed_denominator = total_sum + self.alpha * n_features
                
                log_prob = math.log(smoothed_numerator) - math.log(smoothed_denominator)
                self.feature_log_prob_[c].append(log_prob)

        print("[Naive Bayes] Training completed.")
        return self

    def predict_log_proba(self, X):
        """
        计算样本在各个类别下的对数后验概率。
        log P(c | x) ∝ log P(c) + sum( x_j * log P(w_j | c) )
        """
        predictions_log_prob = []

        for sample in X:
            sample_probs = {}
            for c in self.classes_:
                # 初始为类别的对数先验概率 log P(c)
                log_prob = math.log(self.class_priors_[c])
                
                # 累加每个特征的加权条件对数概率
                for j, tfidf in enumerate(sample):
                    if tfidf > 0: # 只有在样本中出现的词才参与贡献
                        log_prob += tfidf * self.feature_log_prob_[c][j]
                
                sample_probs[c] = log_prob
            predictions_log_prob.append(sample_probs)

        return predictions_log_prob

    def predict(self, X):
        """
        预测类别：选择对数概率最大的类别。
        """
        log_probas = self.predict_log_proba(X)
        predictions = []
        for prob_dict in log_probas:
            # 寻找对数概率最大的类别 key
            predicted_class = max(prob_dict, key=prob_dict.get)
            predictions.append(predicted_class)
        return predictions


# =====================================================================
# 🏃‍♂️ 运行与演示主程序
# =====================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("🚀 P1 Project: 从零实现垃圾邮件分类器 (TF-IDF + Naive Bayes)")
    print("=" * 70)

    # 1. 拆分训练数据
    train_texts = [item[0] for item in TRAIN_DATA]
    train_labels = [item[1] for item in TRAIN_DATA]
    
    test_texts = [item[0] for item in TEST_DATA]
    test_labels = [item[1] for item in TEST_DATA]

    # 2. 文本向量化 (TF-IDF fit & transform)
    print("\n--- 步骤 1: 文本向量化 (Text Vectorization) ---")
    vectorizer = ScratchTFIDFVectorizer()
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)

    # 打印一些有趣的词汇特征
    print("\n部分高价值特征词与对应的 IDF 分数 (高 IDF 代表该词在邮件中罕见，特征区分度高):")
    sample_words = ["free", "money", "meeting", "invoice", "tomorrow", "winner"]
    for word in sample_words:
        if word in vectorizer.vocabulary_:
            print(f"  - [{word}] -> Index: {vectorizer.vocabulary_[word]}, IDF: {vectorizer.idf_[word]:.4f}")

    # 3. 训练朴素贝叶斯模型 (Train Naive Bayes)
    print("\n--- 步骤 2: 训练朴素贝叶斯分类器 (Training Naive Bayes) ---")
    classifier = ScratchNaiveBayesClassifier(alpha=1.0)
    classifier.fit(X_train, train_labels)

    # 打印类别先验概率
    print("\n先验概率 P(Class):")
    for c in classifier.classes_:
        label_name = "垃圾邮件 (Spam)" if c == 1 else "正常邮件 (Ham)"
        print(f"  - {label_name}: {classifier.class_priors_[c]:.2%}")

    # 4. 在测试集上进行评估 (Evaluation on Test Data)
    print("\n--- 步骤 3: 评估测试集 (Testing & Evaluation) ---")
    predictions = classifier.predict(X_test)
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
        print(f"  - 对数概率评分: 正常邮件 {log_probs[i][0]:.2f} | 垃圾邮件 {log_probs[i][1]:.2f}")

    accuracy = correct_predictions / len(test_texts)
    print(f"\n🔥 测试集最终准确率 (Test Accuracy): {accuracy:.2%}")
    print("=" * 70)
