# 数据结构与算法基础

> 这是一篇关于数据结构与算法的介绍性文章，包含了基础知识和代码示例。

::: note 本文最后更新于2023年12月20日，部分内容可能已过时，请注意甄别！
:::

::: reading-time 本文共3000字，阅读大约需要15分钟。
:::

## 1. 数据结构基础

数据结构是计算机科学中组织和存储数据的特定方式，以便能够高效地访问和修改数据。数据结构是算法的基础，是软件设计的重要组成部分。

### 1.1 链表

链表是一种常见的基础数据结构，是一种线性表，但是并不会按线性的顺序存储数据，而是在每一个节点里存到下一个节点的指针。

#### 单向链表

单向链表包含两个域：一个信息域和一个指针域。这个指针指向列表中的下一个节点，而最后一个节点则指向一个空值。

```java
public class Node {
    int data;
    Node next;
    
    public Node(int data) {
        this.data = data;
        this.next = null;
    }
}
```

#### 双向链表

双向链表比单链表稍微复杂，它的每个节点除了存储数据外，还有两个指针分别指向前一个节点和后一个节点。

```kotlin
class Node<T> {
    var data: T
    var prev: Node<T>? = null
    var next: Node<T>? = null
    
    constructor(data: T) {
        this.data = data
    }
}
```

### 1.2 栈与队列

栈和队列都是特殊的线性表。

* **栈(Stack)**: 后进先出(LIFO)，只允许在一端进行插入和删除操作。
* **队列(Queue)**: 先进先出(FIFO)，只允许在一端进行插入，在另一端进行删除操作。

## 2. 算法基础

算法是解决特定问题的一系列步骤，优秀的算法能提高程序的效率。

### 2.1 时间复杂度

时间复杂度是描述算法运行时间随着输入规模增长而增长的速率。常见的时间复杂度有：

| 复杂度 | 名称 | 示例 |
|-------|------|------|
| O(1) | 常数时间 | 数组访问 |
| O(log n) | 对数时间 | 二分查找 |
| O(n) | 线性时间 | 简单查找 |
| O(n log n) | 线性对数时间 | 合并排序 |
| O(n²) | 平方时间 | 冒泡排序 |
| O(2^n) | 指数时间 | 穷举法 |

### 2.2 空间复杂度

空间复杂度描述算法运行时消耗的存储空间与输入规模之间的关系。

## 3. 常见算法实例

### 3.1 递归算法

递归是一种解决问题的方法，它把一个问题分解为越来越小的子问题，直到问题的规模小到可以用较简单的方法解决。

```javascript
// 计算阶乘的递归函数
function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

console.log(factorial(5)); // 输出: 120
```

### 3.2 排序算法

排序算法用于将一组数据按照特定顺序重新排列。

#### 冒泡排序

冒泡排序是一种简单的排序算法，它反复遍历要排序的数列，一次比较两个元素，如果他们的顺序错误就把他们交换过来。

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# 示例
print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))
```

#### 快速排序

快速排序是一种分治算法，通过递归的方式将数据依据一个中心点分成两部分，再对这两部分分别进行排序。

```cpp
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return i + 1;
}
```

## 4. 高级数据结构

除了基本的数据结构外，还有许多高级数据结构用于解决特定问题。

### 4.1 树

树是一种层次性的数据结构，由节点和边组成，没有环路。

```typescript
class TreeNode {
    value: number;
    left: TreeNode | null;
    right: TreeNode | null;
    
    constructor(value: number) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
```

#### 二叉树遍历

二叉树遍历是指按照某种规则访问树中的每个节点，且每个节点只访问一次。三种常见的遍历方式是：前序遍历、中序遍历和后序遍历。

```java
// 前序遍历
public void preOrder(TreeNode root) {
    if (root != null) {
        System.out.print(root.val + " ");
        preOrder(root.left);
        preOrder(root.right);
    }
}

// 中序遍历
public void inOrder(TreeNode root) {
    if (root != null) {
        inOrder(root.left);
        System.out.print(root.val + " ");
        inOrder(root.right);
    }
}

// 后序遍历
public void postOrder(TreeNode root) {
    if (root != null) {
        postOrder(root.left);
        postOrder(root.right);
        System.out.print(root.val + " ");
    }
}
```

### 4.2 图

图是一种比树更加复杂的非线性数据结构，由节点（顶点）和边组成。图可以用来描述事物之间的关系，比如社交网络、交通网络等。

## 总结

本文介绍了基本的数据结构和算法概念，包括链表、栈、队列、递归、排序算法及高级数据结构如树和图。掌握这些基础知识对于解决复杂的计算机科学问题至关重要。

希望这篇文章对你有所帮助！
