# -*- coding: utf-8 -*-
"""
Project 1: Spam Classifier Dataset
这是一个为教学设计的极简邮件数据集。
邮件被划分为：
- Spam (垃圾邮件, 标签为 1): 通常包含 "free", "money", "click", "winner", "urgent" 等高频商业营销词汇。
- Ham (正常邮件, 标签为 0): 通常包含日常工作、会议、学术或社交交流词汇。

This is an educational dataset designed for Project 1.
Labels:
- 1: Spam (Commercial, marketing, urgent financial requests)
- 0: Ham (Normal work-related, personal, meeting arrangements)
"""

# 训练数据集 (Training Dataset)
# 包含 6 封正常邮件和 6 封垃圾邮件，特征非常鲜明
TRAIN_DATA = [
    # --- 正常邮件 (Ham: 0) ---
    ("Hi team, we have a project progress review meeting tomorrow at 10 AM in the main conference room.", 0),
    ("Please find the attached project proposal and invoice for the next quarter's budget planning.", 0),
    ("Are you free for lunch today? I want to discuss the new design layout with you.", 0),
    ("The class schedule has been updated. Please check the student portal for details.", 0),
    ("Can you send me the source code repository link? I need to review your commit.", 0),
    ("Thanks for your quick feedback on the presentation slides. The client loved it.", 0),

    # --- 垃圾邮件 (Spam: 1) ---
    ("Congratulations! You have won a free lottery prize of one million dollars! Click here to claim your money now!", 1),
    ("Urgent: Your account password has been compromised. Click this link to reset it and secure your funds.", 1),
    ("Get cheap software licenses and free bonuses today! Limited time offer, click now to buy!", 1),
    ("Make money fast from home! No experience needed, guaranteed income. Click here to start making money today!", 1),
    ("Dear winner, claim your free luxury cruise holiday prize today! Call this toll-free number now!", 1),
    ("Double your cash overnight with our secret trading algorithm! Click the link to invest now!", 1)
]

# 测试数据集 (Test Dataset)
# 用于评估分类器在“未见过”邮件上的效果
TEST_DATA = [
    # 正常邮件测试 (Expected: 0)
    ("Hello, can we reschedule our review meeting to Friday afternoon?", 0),
    ("Please send the final presentation slides before the meeting starts tomorrow.", 0),
    
    # 垃圾邮件测试 (Expected: 1)
    ("Super cheap deal! Get a free gift and make money online now!", 1),
    ("Urgent action required: Click here to claim your lottery prize money!", 1)
]

def clean_text(text):
    """
    极简的文本清洗与分词函数 (Minimal text preprocessing helper)
    - 统一转为小写 (Lowercase all characters)
    - 移除标点符号 (Remove basic punctuation)
    - 按空格拆分为单词列表 (Tokenize by split)
    """
    import string
    # 转为小写 (Lowercase)
    text = text.lower()
    # 移除非字母数字字符（使用空格代替，防止连词黏在一起）
    cleaned = "".join([char if char not in string.punctuation else " " for char in text])
    # 分词并过滤掉空字符 (Tokenize and remove empty spaces)
    words = [word for word in cleaned.split() if word.strip()]
    return words

if __name__ == "__main__":
    print("--- Dataset Quick Demo ---")
    print(f"Total training samples: {len(TRAIN_DATA)}")
    print(f"Total test samples: {len(TEST_DATA)}")
    print("\nSample preprocessing:")
    sample_text = TRAIN_DATA[6][0]
    print(f"Original: {sample_text}")
    print(f"Cleaned:  {clean_text(sample_text)}")
