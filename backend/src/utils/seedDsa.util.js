const DsaTopic = require('../models/DsaTopic.model');
const DsaProblem = require('../models/DsaProblem.model');

const RAW_TOPICS = [
  'Array Manipulation', 'Math', 'Linear Search', 'Prefix Sum', 'Prefix Product',
  'Matrix', 'String Manipulation', 'String Matching', 'Hashing',
  'Two Pointers', 'Sliding Window', 'Boyer-Moore Voting',
  'Binary Search', 'Sorting', 'Merge Sort', 'Quickselect',
  'Bit Manipulation', 'Stack', 'Linked List', 'Heap',
  'Binary Tree', 'Binary Search Tree', 'AVL Tree', 'Trie', 'Segment Tree', 'Fenwick Tree',
  'Graph', 'BFS', 'DFS', 'Topological Sort', 'Union Find', 'Disjoint Set',
  'Shortest Path', 'Dijkstra', 'Minimum Spanning Tree', 'Graph Coloring',
  'Divide and Conquer', 'Greedy', 'Backtracking', 'Dynamic Programming', "Kadane's Algorithm",
];

const REFERENCE_LINKS = {
  "Array Manipulation": ["https://www.geeksforgeeks.org/array-data-structure/", "https://leetcode.com/tag/array/"],
  "Math": ["https://www.geeksforgeeks.org/mathematics/", "https://www.khanacademy.org/math"],
  "Linear Search": ["https://www.geeksforgeeks.org/linear-search/", "https://www.programiz.com/dsa/linear-search"],
  "Prefix Sum": ["https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/", "https://leetcode.com/tag/prefix-sum/"],
  "Prefix Product": ["https://leetcode.com/problems/product-of-array-except-self/", "https://www.geeksforgeeks.org/prefix-product-array/"],
  "Matrix": ["https://www.geeksforgeeks.org/matrix/", "https://leetcode.com/tag/matrix/"],
  "String Manipulation": ["https://www.geeksforgeeks.org/string-data-structure/", "https://www.programiz.com/python-programming/string"],
  "String Matching": ["https://www.geeksforgeeks.org/string-matching-algorithms/", "https://cp-algorithms.com/string/"],
  "Hashing": ["https://www.geeksforgeeks.org/hashing-data-structure/", "https://leetcode.com/tag/hash-table/"],
  "Two Pointers": ["https://www.geeksforgeeks.org/two-pointers-technique/", "https://leetcode.com/tag/two-pointers/"],
  "Sliding Window": ["https://www.geeksforgeeks.org/window-sliding-technique/", "https://leetcode.com/tag/sliding-window/"],
  "Boyer-Moore Voting": ["https://www.geeksforgeeks.org/boyer-moore-majority-voting-algorithm/", "https://leetcode.com/problems/majority-element/"],
  "Binary Search": ["https://www.geeksforgeeks.org/binary-search/", "https://leetcode.com/tag/binary-search/"],
  "Sorting": ["https://www.geeksforgeeks.org/sorting-algorithms/", "https://visualgo.net/en/sorting"],
  "Merge Sort": ["https://www.geeksforgeeks.org/merge-sort/", "https://visualgo.net/en/sorting"],
  "Quickselect": ["https://www.geeksforgeeks.org/quickselect-algorithm/", "https://leetcode.com/problems/kth-largest-element-in-an-array/"],
  "Bit Manipulation": ["https://www.geeksforgeeks.org/bitwise-algorithms/", "https://leetcode.com/tag/bit-manipulation/"],
  "Stack": ["https://www.geeksforgeeks.org/stack-data-structure/", "https://www.programiz.com/dsa/stack"],
  "Linked List": ["https://www.geeksforgeeks.org/data-structures/linked-list/", "https://www.programiz.com/dsa/linked-list"],
  "Heap": ["https://www.geeksforgeeks.org/heap-data-structure/", "https://leetcode.com/tag/heap-priority-queue/"],
  "Binary Tree": ["https://www.geeksforgeeks.org/binary-tree-data-structure/", "https://visualgo.net/en/bst"],
  "Binary Search Tree": ["https://www.geeksforgeeks.org/binary-search-tree-data-structure/", "https://visualgo.net/en/bst"],
  "AVL Tree": ["https://www.geeksforgeeks.org/avl-tree-set-1-insertion/", "https://visualgo.net/en/bst"],
  "Trie": ["https://www.geeksforgeeks.org/trie-insert-and-search/", "https://leetcode.com/tag/trie/"],
  "Segment Tree": ["https://www.geeksforgeeks.org/segment-tree-data-structure/", "https://cp-algorithms.com/data_structures/segment_tree.html"],
  "Fenwick Tree": ["https://www.geeksforgeeks.org/binary-indexed-tree-or-fenwick-tree/", "https://cp-algorithms.com/data_structures/fenwick.html"],
  "Graph": ["https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/", "https://visualgo.net/en/graphds"],
  "BFS": ["https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/", "https://leetcode.com/tag/breadth-first-search/"],
  "DFS": ["https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/", "https://leetcode.com/tag/depth-first-search/"],
  "Topological Sort": ["https://www.geeksforgeeks.org/topological-sorting/", "https://leetcode.com/tag/topological-sort/"],
  "Union Find": ["https://www.geeksforgeeks.org/union-find/", "https://leetcode.com/tag/union-find/"],
  "Disjoint Set": ["https://www.geeksforgeeks.org/disjoint-set-data-structures/", "https://cp-algorithms.com/data_structures/disjoint_set_union.html"],
  "Shortest Path": ["https://www.geeksforgeeks.org/shortest-path-algorithms-a-comparison/", "https://leetcode.com/tag/shortest-path/"],
  "Dijkstra": ["https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm/", "https://visualgo.net/en/sssp"],
  "Minimum Spanning Tree": ["https://www.geeksforgeeks.org/minimum-spanning-tree/", "https://visualgo.net/en/mst"],
  "Graph Coloring": ["https://www.geeksforgeeks.org/graph-coloring-applications/", "https://cp-algorithms.com/graph/graph_coloring.html"],
  "Divide and Conquer": ["https://www.geeksforgeeks.org/divide-and-conquer-algorithm-introduction/"],
  "Greedy": ["https://www.geeksforgeeks.org/greedy-algorithms/", "https://leetcode.com/tag/greedy/"],
  "Backtracking": ["https://www.geeksforgeeks.org/backtracking-algorithms/", "https://leetcode.com/tag/backtracking/"],
  "Dynamic Programming": ["https://www.geeksforgeeks.org/dynamic-programming/", "https://leetcode.com/tag/dynamic-programming/"],
  "Kadane's Algorithm": ["https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/", "https://leetcode.com/problems/maximum-subarray/"],
};

const INITIAL_PROBLEMS = [
  {
    "id": "leetcode-two-sum-return-indices-adding-to-target",
    "title": "Two Sum – Return indices adding to target",
    "link": "https://leetcode.com/problems/two-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-single-number-every-element-appears-twice-except-one",
    "title": "Single Number – Every element appears twice except one",
    "link": "https://leetcode.com/problems/single-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-duplicates-from-sorted-array",
    "title": "Remove Duplicates from Sorted Array",
    "link": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-move-zeroes",
    "title": "Move Zeroes",
    "link": "https://leetcode.com/problems/move-zeroes/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-subarray",
    "title": "Maximum Subarray",
    "link": "https://leetcode.com/problems/maximum-subarray/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "Kadane's Algorithm"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-contains-duplicate",
    "title": "Contains Duplicate",
    "link": "https://leetcode.com/problems/contains-duplicate/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-rotate-array",
    "title": "Rotate Array",
    "link": "https://leetcode.com/problems/rotate-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-product-of-array-except-self",
    "title": "Product of Array Except Self",
    "link": "https://leetcode.com/problems/product-of-array-except-self/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Product",
    "patterns": [
      "Prefix Product"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-3sum",
    "title": "3Sum",
    "link": "https://leetcode.com/problems/3sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-container-with-most-water",
    "title": "Container With Most Water",
    "link": "https://leetcode.com/problems/container-with-most-water/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-subarray-sum-equals-k",
    "title": "Subarray Sum Equals K",
    "link": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "link": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "link": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "link": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sort-colors",
    "title": "Sort Colors",
    "link": "https://leetcode.com/problems/sort-colors/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-product-subarray",
    "title": "Maximum Product Subarray",
    "link": "https://leetcode.com/problems/maximum-product-subarray/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-next-permutation",
    "title": "Next Permutation",
    "link": "https://leetcode.com/problems/next-permutation/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-trapping-rain-water",
    "title": "Trapping Rain Water",
    "link": "https://leetcode.com/problems/trapping-rain-water/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-second-largest-element",
    "title": "Second Largest Element",
    "link": "https://www.geeksforgeeks.org/find-second-largest-element-in-an-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-reverse-array-in-groups",
    "title": "Reverse Array in Groups",
    "link": "https://www.geeksforgeeks.org/reverse-array-groups-given-size/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-wave-array",
    "title": "Wave Array",
    "link": "https://www.geeksforgeeks.org/sort-array-wave-form-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-leaders-in-array",
    "title": "Leaders in Array",
    "link": "https://www.geeksforgeeks.org/leaders-in-an-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-missing-and-repeating-number",
    "title": "Find Missing and Repeating Number",
    "link": "https://www.geeksforgeeks.org/find-a-repeating-and-a-missing-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-majority-element",
    "title": "Majority Element",
    "link": "https://www.geeksforgeeks.org/majority-element/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Boyer-Moore Voting",
    "patterns": [
      "Boyer-Moore Voting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-majority-element-ii-n-3-times-",
    "title": "Majority Element II (N/3 times)",
    "link": "https://www.geeksforgeeks.org/find-elements-occurs-array-n3-times/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Boyer-Moore Voting",
    "patterns": [
      "Boyer-Moore Voting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-stock-buy-and-sell-multiple-transactions",
    "title": "Stock Buy and Sell – Multiple Transactions",
    "link": "https://www.geeksforgeeks.org/stock-buy-sell/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-circular-subarray-sum",
    "title": "Maximum Circular Subarray Sum",
    "link": "https://www.geeksforgeeks.org/maximum-contiguous-circular-sum/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "Kadane's Algorithm"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-number-occurring-odd-number-of-times",
    "title": "Find Number Occurring Odd Number of Times",
    "link": "https://www.geeksforgeeks.org/find-the-number-occurring-odd-number-of-times/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-median-of-two-sorted-arrays",
    "title": "Median of Two Sorted Arrays",
    "link": "https://www.geeksforgeeks.org/median-of-two-sorted-arrays-of-different-sizes/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-three-sum-closest",
    "title": "Three Sum Closest",
    "link": "https://www.geeksforgeeks.org/find-three-elements-closest-sum-to-a-given-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-kth-smallest-largest-element",
    "title": "Kth Smallest/Largest Element",
    "link": "https://www.geeksforgeeks.org/kth-smallestlargest-element-unsorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Quickselect",
    "patterns": [
      "Quickselect"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-zig-zag-array",
    "title": "Zig-Zag Array",
    "link": "https://www.geeksforgeeks.org/convert-array-into-zig-zag-fashion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-index-difference",
    "title": "Maximum Index Difference",
    "link": "https://www.geeksforgeeks.org/maximum-index-difference/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-split-into-three-equal-sum-segments",
    "title": "Split Into Three Equal Sum Segments",
    "link": "https://www.geeksforgeeks.org/count-ways-to-divide-array-in-three-contiguous-parts-having-equal-sum/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Array Manipulation",
    "patterns": [
      "Array Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-valid-parentheses",
    "title": "Valid Parentheses",
    "link": "https://leetcode.com/problems/valid-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-implement-strstr-",
    "title": "Implement strStr()",
    "link": "https://leetcode.com/problems/implement-strstr/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Matching",
    "patterns": [
      "String Matching"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-and-say",
    "title": "Count and Say",
    "link": "https://leetcode.com/problems/count-and-say/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-group-anagrams",
    "title": "Group Anagrams",
    "link": "https://leetcode.com/problems/group-anagrams/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-palindrome-number",
    "title": "Palindrome Number",
    "link": "https://leetcode.com/problems/palindrome-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-integer-to-roman",
    "title": "Integer to Roman",
    "link": "https://leetcode.com/problems/integer-to-roman/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-roman-to-integer",
    "title": "Roman to Integer",
    "link": "https://leetcode.com/problems/roman-to-integer/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-add-binary",
    "title": "Add Binary",
    "link": "https://leetcode.com/problems/add-binary/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-multiply-strings",
    "title": "Multiply Strings",
    "link": "https://leetcode.com/problems/multiply-strings/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-repeating-character-replacement",
    "title": "Longest Repeating Character Replacement",
    "link": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-decode-ways",
    "title": "Decode Ways",
    "link": "https://leetcode.com/problems/decode-ways/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-binary-substrings",
    "title": "Count Binary Substrings",
    "link": "https://leetcode.com/problems/count-binary-substrings/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-window-substring",
    "title": "Minimum Window Substring",
    "link": "https://leetcode.com/problems/minimum-window-substring/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-custom-sort-string",
    "title": "Custom Sort String",
    "link": "https://leetcode.com/problems/custom-sort-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-buddy-strings",
    "title": "Buddy Strings",
    "link": "https://leetcode.com/problems/buddy-strings/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sentence-similarity",
    "title": "Sentence Similarity",
    "link": "https://leetcode.com/problems/sentence-similarity/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-repeated-substring-pattern",
    "title": "Repeated Substring Pattern",
    "link": "https://leetcode.com/problems/repeated-substring-pattern/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-palindromic-subsequence",
    "title": "Longest Palindromic Subsequence",
    "link": "https://leetcode.com/problems/longest-palindromic-subsequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-valid-number",
    "title": "Valid Number",
    "link": "https://leetcode.com/problems/valid-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-simplify-path",
    "title": "Simplify Path",
    "link": "https://leetcode.com/problems/simplify-path/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-evaluate-reverse-polish-notation",
    "title": "Evaluate Reverse Polish Notation",
    "link": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-valid-word-abbreviation",
    "title": "Valid Word Abbreviation",
    "link": "https://leetcode.com/problems/valid-word-abbreviation/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-two-strings-are-anagrams-of-each-other",
    "title": "Check if two strings are anagrams of each other",
    "link": "https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-permutations-of-a-string",
    "title": "Print all permutations of a string",
    "link": "https://www.geeksforgeeks.org/write-a-c-program-to-print-all-permutations-of-a-given-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-first-non-repeating-character-in-a-string",
    "title": "Find the first non-repeating character in a string",
    "link": "https://www.geeksforgeeks.org/find-first-non-repeating-character-in-a-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-strings-are-rotations-of-each-other",
    "title": "Check if strings are rotations of each other",
    "link": "https://www.geeksforgeeks.org/check-if-two-given-strings-are-rotations-of-each-other/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-remove-duplicates-from-a-string",
    "title": "Remove duplicates from a string",
    "link": "https://www.geeksforgeeks.org/remove-duplicates-from-a-given-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-string-is-a-valid-shuffle-of-two-strings",
    "title": "Check if a string is a valid shuffle of two strings",
    "link": "https://www.geeksforgeeks.org/check-if-a-string-is-shuffle-of-two-strings/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-possible-palindromic-partitions-of-a-string",
    "title": "Find all possible palindromic partitions of a string",
    "link": "https://www.geeksforgeeks.org/palindromic-parts-partitioning/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-compare-two-version-numbers",
    "title": "Compare two version numbers",
    "link": "https://www.geeksforgeeks.org/compare-two-version-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-string-contains-only-digits",
    "title": "Check if a string contains only digits",
    "link": "https://www.geeksforgeeks.org/check-if-string-contains-only-digits/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-string-is-binary-string-or-not",
    "title": "Check if a string is binary string or not",
    "link": "https://www.geeksforgeeks.org/check-binary-string-not/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-longest-common-subsequence",
    "title": "Longest common subsequence",
    "link": "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-occurrences-of-anagrams",
    "title": "Count occurrences of anagrams",
    "link": "https://www.geeksforgeeks.org/count-occurrences-of-anagrams/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-generate-all-binary-strings-of-size-n-without-consecutive-1s",
    "title": "Generate all binary strings of size N without consecutive 1s",
    "link": "https://www.geeksforgeeks.org/generate-binary-strings-without-consecutive-1s/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced",
    "title": "Minimum number of bracket reversals needed to make an expression balanced",
    "link": "https://www.geeksforgeeks.org/minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-convert-string-to-number",
    "title": "Convert string to number",
    "link": "https://www.geeksforgeeks.org/write-your-own-atoi/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-maximum-occurring-character-in-a-string",
    "title": "Find maximum occurring character in a string",
    "link": "https://www.geeksforgeeks.org/find-the-maximum-occurring-character-in-the-input-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-two-strings-are-isomorphic",
    "title": "Check if two strings are isomorphic",
    "link": "https://www.geeksforgeeks.org/check-if-two-strings-are-isomorphic-to-each-other/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-length-of-longest-substring-with-at-most-k-distinct-characters",
    "title": "Find length of longest substring with at most k distinct characters",
    "link": "https://www.geeksforgeeks.org/longest-substring-k-distinct-characters/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-string-can-be-palindrome-by-removing-at-most-one-character",
    "title": "Check if a string can be palindrome by removing at most one character",
    "link": "https://www.geeksforgeeks.org/check-if-string-can-be-palindrome-by-removing-at-most-one-character/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-linked-list",
    "title": "Reverse Linked List",
    "link": "https://leetcode.com/problems/reverse-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "link": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-add-two-numbers",
    "title": "Add Two Numbers",
    "link": "https://leetcode.com/problems/add-two-numbers/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-linked-list-cycle",
    "title": "Linked List Cycle",
    "link": "https://leetcode.com/problems/linked-list-cycle/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-nth-node-from-end-of-list",
    "title": "Remove Nth Node From End of List",
    "link": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-intersection-of-two-linked-lists",
    "title": "Intersection of Two Linked Lists",
    "link": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-copy-list-with-random-pointer",
    "title": "Copy List with Random Pointer",
    "link": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-odd-even-linked-list",
    "title": "Odd Even Linked List",
    "link": "https://leetcode.com/problems/odd-even-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-palindrome-linked-list",
    "title": "Palindrome Linked List",
    "link": "https://leetcode.com/problems/palindrome-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-flatten-a-multilevel-doubly-linked-list",
    "title": "Flatten a Multilevel Doubly Linked List",
    "link": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List",
      "Doubly Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reorder-list",
    "title": "Reorder List",
    "link": "https://leetcode.com/problems/reorder-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-linked-list-elements",
    "title": "Remove Linked List Elements",
    "link": "https://leetcode.com/problems/remove-linked-list-elements/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-rotate-list",
    "title": "Rotate List",
    "link": "https://leetcode.com/problems/rotate-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-delete-node-in-a-linked-list",
    "title": "Delete Node in a Linked List",
    "link": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-swap-nodes-in-pairs",
    "title": "Swap Nodes in Pairs",
    "link": "https://leetcode.com/problems/swap-nodes-in-pairs/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sort-list",
    "title": "Sort List",
    "link": "https://leetcode.com/problems/sort-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Merge Sort",
    "patterns": [
      "Merge Sort"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-split-linked-list-in-parts",
    "title": "Split Linked List in Parts",
    "link": "https://leetcode.com/problems/split-linked-list-in-parts/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-duplicates-from-sorted-list",
    "title": "Remove Duplicates from Sorted List",
    "link": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-merge-k-sorted-lists",
    "title": "Merge k Sorted Lists",
    "link": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-middle-of-a-linked-list",
    "title": "Find the middle of a linked list",
    "link": "https://www.geeksforgeeks.org/find-middle-of-the-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-segregate-even-and-odd-nodes-in-linked-list",
    "title": "Segregate even and odd nodes in linked list",
    "link": "https://www.geeksforgeeks.org/segregate-even-and-odd-nodes-in-a-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-delete-nodes-which-have-a-greater-value-on-right-side",
    "title": "Delete nodes which have a greater value on right side",
    "link": "https://www.geeksforgeeks.org/delete-nodes-which-have-a-greater-value-on-right-side/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-reverse-alternate-nodes-and-append-at-the-end",
    "title": "Reverse alternate nodes and append at the end",
    "link": "https://www.geeksforgeeks.org/reverse-alternate-nodes-append-end/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-remove-loop-in-linked-list",
    "title": "Remove loop in linked list",
    "link": "https://www.geeksforgeeks.org/remove-loop-in-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-delete-entire-linked-list",
    "title": "Delete entire linked list",
    "link": "https://www.geeksforgeeks.org/delete-entire-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-set-matrix-zeroes",
    "title": "Set Matrix Zeroes",
    "link": "https://leetcode.com/problems/set-matrix-zeroes/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix",
      "Matrix Traversal"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-rotate-image",
    "title": "Rotate Image",
    "link": "https://leetcode.com/problems/rotate-image/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix",
      "Matrix Traversal"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-spiral-matrix",
    "title": "Spiral Matrix",
    "link": "https://leetcode.com/problems/spiral-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix",
      "Matrix Traversal"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-search-a-2d-matrix",
    "title": "Search a 2D Matrix",
    "link": "https://leetcode.com/problems/search-a-2d-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-word-search",
    "title": "Word Search",
    "link": "https://leetcode.com/problems/word-search/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-game-of-life",
    "title": "Game of Life",
    "link": "https://leetcode.com/problems/game-of-life/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximal-square",
    "title": "Maximal Square",
    "link": "https://leetcode.com/problems/maximal-square/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-diagonal-traverse",
    "title": "Diagonal Traverse",
    "link": "https://leetcode.com/problems/diagonal-traverse/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-image-smoother",
    "title": "Image Smoother",
    "link": "https://leetcode.com/problems/image-smoother/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-toeplitz-matrix",
    "title": "Toeplitz Matrix",
    "link": "https://leetcode.com/problems/toeplitz-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-matrix-block-sum",
    "title": "Matrix Block Sum",
    "link": "https://leetcode.com/problems/matrix-block-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-islands",
    "title": "Number of Islands",
    "link": "https://leetcode.com/problems/number-of-islands/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-flood-fill",
    "title": "Flood Fill",
    "link": "https://leetcode.com/problems/flood-fill/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-pacific-atlantic-water-flow",
    "title": "Pacific Atlantic Water Flow",
    "link": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-kth-smallest-element-in-a-sorted-matrix",
    "title": "Kth Smallest Element in a Sorted Matrix",
    "link": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-transpose-of-a-matrix",
    "title": "Find transpose of a matrix",
    "link": "https://www.geeksforgeeks.org/program-to-find-transpose-of-a-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-possible-paths-from-top-left-to-bottom-right-of-a-matrix",
    "title": "Print all possible paths from top left to bottom right of a matrix",
    "link": "https://www.geeksforgeeks.org/print-all-possible-paths-from-top-left-to-bottom-right-of-a-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-median-in-a-row-wise-sorted-matrix",
    "title": "Find median in a row-wise sorted matrix",
    "link": "https://www.geeksforgeeks.org/find-median-row-wise-sorted-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-rotate-matrix-elements",
    "title": "Rotate matrix elements",
    "link": "https://www.geeksforgeeks.org/rotate-matrix-elements/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-boolean-matrix-problem",
    "title": "Boolean matrix problem",
    "link": "https://www.geeksforgeeks.org/boolean-matrix-problem/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-diagonals-of-a-matrix",
    "title": "Print diagonals of a matrix",
    "link": "https://www.geeksforgeeks.org/print-diagonals-of-a-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Matrix",
    "patterns": [
      "Matrix"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-largest-square-of-1-s-in-a-binary-matrix",
    "title": "Find largest square of 1's in a binary matrix",
    "link": "https://www.geeksforgeeks.org/maximum-size-sub-matrix-with-all-1s-in-a-binary-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-integer",
    "title": "Reverse Integer",
    "link": "https://leetcode.com/problems/reverse-integer/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-divide-two-integers",
    "title": "Divide Two Integers",
    "link": "https://leetcode.com/problems/divide-two-integers/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-power-of-three",
    "title": "Power of Three",
    "link": "https://leetcode.com/problems/power-of-three/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-power-of-two",
    "title": "Power of Two",
    "link": "https://leetcode.com/problems/power-of-two/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-power-of-four",
    "title": "Power of Four",
    "link": "https://leetcode.com/problems/power-of-four/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sqrt-x-",
    "title": "Sqrt(x)",
    "link": "https://leetcode.com/problems/sqrtx/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-add-digits",
    "title": "Add Digits",
    "link": "https://leetcode.com/problems/add-digits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-ugly-number",
    "title": "Ugly Number",
    "link": "https://leetcode.com/problems/ugly-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-climbing-stairs",
    "title": "Climbing Stairs",
    "link": "https://leetcode.com/problems/climbing-stairs/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-factorial-trailing-zeroes",
    "title": "Factorial Trailing Zeroes",
    "link": "https://leetcode.com/problems/factorial-trailing-zeroes/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-happy-number",
    "title": "Happy Number",
    "link": "https://leetcode.com/problems/happy-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-excel-sheet-column-number",
    "title": "Excel Sheet Column Number",
    "link": "https://leetcode.com/problems/excel-sheet-column-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-excel-sheet-column-title",
    "title": "Excel Sheet Column Title",
    "link": "https://leetcode.com/problems/excel-sheet-column-title/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-primes",
    "title": "Count Primes",
    "link": "https://leetcode.com/problems/count-primes/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-pow-x-n-",
    "title": "Pow(x, n)",
    "link": "https://leetcode.com/problems/powx-n/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math",
      "Number Theory (GCD/Sieve)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-is-perfect-square",
    "title": "Is Perfect Square",
    "link": "https://leetcode.com/problems/valid-perfect-square/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-1-bits",
    "title": "Number of 1 Bits",
    "link": "https://leetcode.com/problems/number-of-1-bits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sum-of-two-integers",
    "title": "Sum of Two Integers",
    "link": "https://leetcode.com/problems/sum-of-two-integers/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-hamming-distance",
    "title": "Hamming Distance",
    "link": "https://leetcode.com/problems/hamming-distance/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-number-is-prime",
    "title": "Check if a number is prime",
    "link": "https://www.geeksforgeeks.org/prime-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-factorial-of-a-number",
    "title": "Find the factorial of a number",
    "link": "https://www.geeksforgeeks.org/factorial-large-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-a-number-is-armstrong",
    "title": "Check if a number is Armstrong",
    "link": "https://www.geeksforgeeks.org/armstrong-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-gcd-of-two-numbers",
    "title": "Find GCD of two numbers",
    "link": "https://www.geeksforgeeks.org/c-program-to-find-gcd-or-hcf-of-two-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-lcm-of-two-numbers",
    "title": "Find LCM of two numbers",
    "link": "https://www.geeksforgeeks.org/c-program-to-find-lcm-of-two-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-number-is-perfect",
    "title": "Check if number is perfect",
    "link": "https://www.geeksforgeeks.org/check-if-a-number-is-perfect-or-not/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-sum-of-digits-of-a-number",
    "title": "Sum of digits of a number",
    "link": "https://www.geeksforgeeks.org/sum-of-digits-of-a-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-power-of-a-number",
    "title": "Find the power of a number",
    "link": "https://www.geeksforgeeks.org/write-a-c-program-to-calculate-powxn/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-square-root-of-a-number",
    "title": "Find the square root of a number",
    "link": "https://www.geeksforgeeks.org/square-root-of-a-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-set-bits-in-a-number",
    "title": "Count set bits in a number",
    "link": "https://www.geeksforgeeks.org/count-set-bits-in-an-integer/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-prime-factors-of-a-number",
    "title": "Find all prime factors of a number",
    "link": "https://www.geeksforgeeks.org/print-all-prime-factors-of-a-given-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-digital-root-of-a-number",
    "title": "Find the digital root of a number",
    "link": "https://www.geeksforgeeks.org/find-digital-root-of-a-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-calculate-nth-fibonacci-number",
    "title": "Calculate nth Fibonacci number",
    "link": "https://www.geeksforgeeks.org/program-for-nth-fibonacci-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-sum-of-first-n-natural-numbers",
    "title": "Sum of first n natural numbers",
    "link": "https://www.geeksforgeeks.org/sum-of-first-n-natural-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-gcd-of-an-array",
    "title": "Find GCD of an array",
    "link": "https://www.geeksforgeeks.org/gcd-of-array-elements/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-calculate-permutations-and-combinations",
    "title": "Calculate permutations and combinations",
    "link": "https://www.geeksforgeeks.org/print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-calculate-power-using-recursion",
    "title": "Calculate power using recursion",
    "link": "https://www.geeksforgeeks.org/write-a-recursive-function-to-calculate-power-of-a-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-sum-of-two-numbers-without-operator",
    "title": "Find sum of two numbers without + operator",
    "link": "https://www.geeksforgeeks.org/sum-of-two-numbers-without-using-arithmetic-operators/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-factorial-using-recursion",
    "title": "Find factorial using recursion",
    "link": "https://www.geeksforgeeks.org/factorial-of-a-number-using-recursion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-digits-in-a-number",
    "title": "Count digits in a number",
    "link": "https://www.geeksforgeeks.org/count-digits-in-an-integer/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-greatest-common-divisor-of-strings",
    "title": "Greatest Common Divisor of Strings",
    "link": "https://leetcode.com/problems/greatest-common-divisor-of-strings/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-greatest-common-divisor-of-array",
    "title": "Find Greatest Common Divisor of Array",
    "link": "https://leetcode.com/problems/find-greatest-common-divisor-of-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-ugly-number-ii",
    "title": "Ugly Number II",
    "link": "https://leetcode.com/problems/ugly-number-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sum-of-digits-in-base-k",
    "title": "Sum of Digits in Base K",
    "link": "https://leetcode.com/problems/sum-of-digits-in-base-k/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-rotate-digits",
    "title": "Rotate Digits",
    "link": "https://leetcode.com/problems/rotate-digits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reordered-power-of-2",
    "title": "Reordered Power of 2",
    "link": "https://leetcode.com/problems/reordered-power-of-2/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-is-subsequence",
    "title": "Is Subsequence",
    "link": "https://leetcode.com/problems/is-subsequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "String Manipulation",
    "patterns": [
      "String Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-prime-number-of-set-bits-in-binary-representation",
    "title": "Prime Number of Set Bits in Binary Representation",
    "link": "https://leetcode.com/problems/prime-number-of-set-bits-in-binary-representation/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-sieve-of-eratosthenes",
    "title": "Sieve of Eratosthenes",
    "link": "https://www.geeksforgeeks.org/sieve-of-eratosthenes/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-modular-exponentiation",
    "title": "Modular exponentiation",
    "link": "https://www.geeksforgeeks.org/modular-exponentiation-power-in-modular-arithmetic/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-modular-multiplicative-inverse",
    "title": "Modular multiplicative inverse",
    "link": "https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-digits-in-factorial",
    "title": "Count digits in factorial",
    "link": "https://www.geeksforgeeks.org/count-digits-factorial-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-remainder-without-modulo-operator",
    "title": "Find remainder without modulo operator",
    "link": "https://www.geeksforgeeks.org/find-remainder-without-using-modulo-operator/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-basic-calculator",
    "title": "Basic Calculator",
    "link": "https://leetcode.com/problems/basic-calculator/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sudoku-solver",
    "title": "Sudoku Solver",
    "link": "https://leetcode.com/problems/sudoku-solver/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-n-queens",
    "title": "N-Queens",
    "link": "https://leetcode.com/problems/n-queens/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-n-queens-ii",
    "title": "N-Queens II",
    "link": "https://leetcode.com/problems/n-queens-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-expression-add-operators",
    "title": "Expression Add Operators",
    "link": "https://leetcode.com/problems/expression-add-operators/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-guess-number-higher-or-lower",
    "title": "Guess Number Higher or Lower",
    "link": "https://leetcode.com/problems/guess-number-higher-or-lower/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-guess-number-higher-or-lower-ii",
    "title": "Guess Number Higher or Lower II",
    "link": "https://leetcode.com/problems/guess-number-higher-or-lower-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-valid-sudoku",
    "title": "Valid Sudoku",
    "link": "https://leetcode.com/problems/valid-sudoku/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-combination-sum",
    "title": "Combination Sum",
    "link": "https://leetcode.com/problems/combination-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-combination-sum-ii",
    "title": "Combination Sum II",
    "link": "https://leetcode.com/problems/combination-sum-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-surrounded-regions",
    "title": "Surrounded Regions",
    "link": "https://leetcode.com/problems/surrounded-regions/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-course-schedule",
    "title": "Course Schedule",
    "link": "https://leetcode.com/problems/course-schedule/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-course-schedule-ii",
    "title": "Course Schedule II",
    "link": "https://leetcode.com/problems/course-schedule-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-valid-parentheses",
    "title": "Longest Valid Parentheses",
    "link": "https://leetcode.com/problems/longest-valid-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-different-ways-to-add-parentheses",
    "title": "Different Ways to Add Parentheses",
    "link": "https://leetcode.com/problems/different-ways-to-add-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Divide and Conquer",
    "patterns": [
      "Divide and Conquer"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-alien-dictionary",
    "title": "Alien Dictionary",
    "link": "https://leetcode.com/problems/alien-dictionary/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Topological Sort",
    "patterns": [
      "Topological Sort"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sliding-puzzle",
    "title": "Sliding Puzzle",
    "link": "https://leetcode.com/problems/sliding-puzzle/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-missing-number-in-an-array",
    "title": "Find the missing number in an array",
    "link": "https://www.geeksforgeeks.org/find-the-missing-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-detect-cycle-in-a-directed-graph",
    "title": "Detect cycle in a directed graph",
    "link": "https://www.geeksforgeeks.org/detect-cycle-in-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-solve-the-rat-in-a-maze-problem",
    "title": "Solve the rat in a maze problem",
    "link": "https://www.geeksforgeeks.org/rat-in-a-maze-backtracking-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-word-break-problem",
    "title": "Word Break Problem",
    "link": "https://www.geeksforgeeks.org/word-break-problem-dp-32/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-subsets-of-a-set",
    "title": "Find all subsets of a set",
    "link": "https://www.geeksforgeeks.org/find-subsets-given-set/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-path-exists-in-a-matrix",
    "title": "Find if path exists in a matrix",
    "link": "https://www.geeksforgeeks.org/find-path-in-a-matrix-with-given-sequence/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-expression-evaluation-using-stack",
    "title": "Expression Evaluation using Stack",
    "link": "https://www.geeksforgeeks.org/expression-evaluation/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-topological-sort",
    "title": "Topological Sort",
    "link": "https://www.geeksforgeeks.org/topological-sorting/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-subset-sum-problem",
    "title": "Subset Sum Problem",
    "link": "https://www.geeksforgeeks.org/subset-sum-problem-dp-25/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-duplicate-in-an-array",
    "title": "Find duplicate in an array",
    "link": "https://www.geeksforgeeks.org/find-duplicate-in-an-array-of-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-array-is-subset-of-another-array",
    "title": "Find if array is subset of another array",
    "link": "https://www.geeksforgeeks.org/find-whether-an-array-is-subset-of-another-array-set-1/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-coin-change-problem",
    "title": "Coin Change Problem",
    "link": "https://www.geeksforgeeks.org/coin-change-dp-7/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-minimum-number-of-jumps-to-reach-end",
    "title": "Minimum number of jumps to reach end",
    "link": "https://www.geeksforgeeks.org/minimum-number-of-jumps-to-reach-end-of-a-given-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-min-stack",
    "title": "Min Stack",
    "link": "https://leetcode.com/problems/min-stack/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-daily-temperatures",
    "title": "Daily Temperatures",
    "link": "https://leetcode.com/problems/daily-temperatures/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-next-greater-element-i",
    "title": "Next Greater Element I",
    "link": "https://leetcode.com/problems/next-greater-element-i/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-next-greater-element-ii",
    "title": "Next Greater Element II",
    "link": "https://leetcode.com/problems/next-greater-element-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-implement-queue-using-stacks",
    "title": "Implement Queue using Stacks",
    "link": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "link": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-k-digits",
    "title": "Remove K Digits",
    "link": "https://leetcode.com/problems/remove-k-digits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-decode-string",
    "title": "Decode String",
    "link": "https://leetcode.com/problems/decode-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-score-of-parentheses",
    "title": "Score of Parentheses",
    "link": "https://leetcode.com/problems/score-of-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-duplicate-letters",
    "title": "Remove Duplicate Letters",
    "link": "https://leetcode.com/problems/remove-duplicate-letters/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-implement-stack-using-arrays",
    "title": "Implement Stack using Arrays",
    "link": "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-implement-stack-using-linked-list",
    "title": "Implement Stack using Linked List",
    "link": "https://www.geeksforgeeks.org/implement-a-stack-using-singly-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-evaluate-postfix-expression",
    "title": "Evaluate Postfix Expression",
    "link": "https://www.geeksforgeeks.org/stack-set-4-evaluation-postfix-expression/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-infix-to-postfix-conversion",
    "title": "Infix to Postfix Conversion",
    "link": "https://www.geeksforgeeks.org/infix-to-postfix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-infix-to-prefix-conversion",
    "title": "Infix to Prefix Conversion",
    "link": "https://www.geeksforgeeks.org/infix-to-prefix-expression-conversion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-stock-span-problem",
    "title": "Stock Span Problem",
    "link": "https://www.geeksforgeeks.org/the-stock-span-problem/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-celebrity-in-a-party",
    "title": "Find the celebrity in a party",
    "link": "https://www.geeksforgeeks.org/the-celebrity-problem/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-reverse-a-stack-using-recursion",
    "title": "Reverse a Stack using Recursion",
    "link": "https://www.geeksforgeeks.org/reverse-a-stack-using-recursion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-sort-a-stack-using-recursion",
    "title": "Sort a Stack using Recursion",
    "link": "https://www.geeksforgeeks.org/sort-a-stack-using-recursion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-minimum-element-in-a-stack-in-o-1-time",
    "title": "Find the minimum element in a stack in O(1) time",
    "link": "https://www.geeksforgeeks.org/design-and-implement-special-stack-data-structure/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-merge-intervals",
    "title": "Merge Intervals",
    "link": "https://leetcode.com/problems/merge-intervals/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "link": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Quickselect",
    "patterns": [
      "Quickselect"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-search",
    "title": "Binary Search",
    "link": "https://leetcode.com/problems/binary-search/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-first-bad-version",
    "title": "First Bad Version",
    "link": "https://leetcode.com/problems/first-bad-version/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-peak-element",
    "title": "Find Peak Element",
    "link": "https://leetcode.com/problems/find-peak-element/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-search-insert-position",
    "title": "Search Insert Position",
    "link": "https://leetcode.com/problems/search-insert-position/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "link": "https://leetcode.com/problems/top-k-frequent-elements/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-intersection-of-two-arrays-ii",
    "title": "Intersection of Two Arrays II",
    "link": "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-h-index",
    "title": "H-Index",
    "link": "https://leetcode.com/problems/h-index/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-of-smaller-numbers-after-self",
    "title": "Count of Smaller Numbers After Self",
    "link": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-duplicate-number",
    "title": "Find the Duplicate Number",
    "link": "https://leetcode.com/problems/find-the-duplicate-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-k-closest-elements",
    "title": "Find K Closest Elements",
    "link": "https://leetcode.com/problems/find-k-closest-elements/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-split-array-largest-sum",
    "title": "Split Array Largest Sum",
    "link": "https://leetcode.com/problems/split-array-largest-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search",
      "Binary Search on Answer"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-celebrity",
    "title": "Find the Celebrity",
    "link": "https://leetcode.com/problems/find-the-celebrity/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Graph",
    "patterns": [
      "Graph"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-increasing-subsequence",
    "title": "Longest Increasing Subsequence",
    "link": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP on Subsequences",
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-merge-sorted-array",
    "title": "Merge Sorted Array",
    "link": "https://leetcode.com/problems/merge-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-wiggle-sort",
    "title": "Wiggle Sort",
    "link": "https://leetcode.com/problems/wiggle-sort/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-of-range-sum",
    "title": "Count of Range Sum",
    "link": "https://leetcode.com/problems/count-of-range-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-merge-sort",
    "title": "Merge Sort",
    "link": "https://www.geeksforgeeks.org/merge-sort/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-quick-sort",
    "title": "Quick Sort",
    "link": "https://www.geeksforgeeks.org/quick-sort/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-heap-sort",
    "title": "Heap Sort",
    "link": "https://www.geeksforgeeks.org/heap-sort/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-counting-sort",
    "title": "Counting Sort",
    "link": "https://www.geeksforgeeks.org/counting-sort/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-radix-sort",
    "title": "Radix Sort",
    "link": "https://www.geeksforgeeks.org/radix-sort/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-bucket-sort",
    "title": "Bucket Sort",
    "link": "https://www.geeksforgeeks.org/bucket-sort-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-smallest-and-second-smallest-elements-in-an-array",
    "title": "Find the smallest and second smallest elements in an array",
    "link": "https://www.geeksforgeeks.org/find-second-smallest-element-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-floor-and-ceil-of-a-number-in-a-sorted-array",
    "title": "Find floor and ceil of a number in a sorted array",
    "link": "https://www.geeksforgeeks.org/floor-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-element-that-appears-once-in-a-sorted-array-where-every-other-element-appears-twice",
    "title": "Find the element that appears once in a sorted array where every other element appears twice",
    "link": "https://www.geeksforgeeks.org/find-element-appears-once-sorted-array-every-element-appears-twice/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-inversions-in-an-array",
    "title": "Count Inversions in an array",
    "link": "https://www.geeksforgeeks.org/counting-inversions/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-median-in-a-stream-of-running-integers",
    "title": "Find median in a stream of running integers",
    "link": "https://www.geeksforgeeks.org/median-of-stream-of-integers-running-integers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-element-with-maximum-frequency-in-a-sorted-array",
    "title": "Find the element with maximum frequency in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-the-element-with-maximum-frequency-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-first-and-last-occurrence-of-an-element-in-a-sorted-array",
    "title": "Find the first and last occurrence of an element in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-first-and-last-occurrence-of-x-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-number-of-elements-less-than-or-equal-to-x-in-a-sorted-array",
    "title": "Find the number of elements less than or equal to x in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-the-number-of-elements-less-than-or-equal-to-x-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-smallest-positive-missing-number",
    "title": "Find smallest positive missing number",
    "link": "https://www.geeksforgeeks.org/find-the-smallest-positive-number-missing-from-an-unsorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-two-repeating-elements-in-an-array",
    "title": "Find the two repeating elements in an array",
    "link": "https://www.geeksforgeeks.org/find-two-repeating-elements-in-a-given-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-sum-query-immutable",
    "title": "Range Sum Query - Immutable",
    "link": "https://leetcode.com/problems/range-sum-query-immutable/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-sum-query-2d-immutable",
    "title": "Range Sum Query 2D - Immutable",
    "link": "https://leetcode.com/problems/range-sum-query-2d-immutable/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-addition",
    "title": "Range Addition",
    "link": "https://leetcode.com/problems/range-addition/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-population-year",
    "title": "Maximum Population Year",
    "link": "https://leetcode.com/problems/maximum-population-year/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-continuous-subarray-sum",
    "title": "Continuous Subarray Sum",
    "link": "https://leetcode.com/problems/continuous-subarray-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-pivot-index",
    "title": "Find Pivot Index",
    "link": "https://leetcode.com/problems/find-pivot-index/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-size-subarray-sum-equals-k",
    "title": "Maximum Size Subarray Sum Equals k",
    "link": "https://leetcode.com/problems/maximum-size-subarray-sum-equals-k/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-size-subarray-sum",
    "title": "Minimum Size Subarray Sum",
    "link": "https://leetcode.com/problems/minimum-size-subarray-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-subarrays-with-bounded-maximum",
    "title": "Number of Subarrays with Bounded Maximum",
    "link": "https://leetcode.com/problems/number-of-subarrays-with-bounded-maximum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-car-pooling",
    "title": "Car Pooling",
    "link": "https://leetcode.com/problems/car-pooling/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-nice-subarrays",
    "title": "Number of Nice Subarrays",
    "link": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-number-of-teams",
    "title": "Count Number of Teams",
    "link": "https://leetcode.com/problems/count-number-of-teams/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-well-performing-interval",
    "title": "Longest Well-Performing Interval",
    "link": "https://leetcode.com/problems/longest-well-performing-interval/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-longest-valid-obstacle-course-at-each-position",
    "title": "Find the Longest Valid Obstacle Course at Each Position",
    "link": "https://leetcode.com/problems/find-the-longest-valid-obstacle-course-at-each-position/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-subarrays-with-equal-sum",
    "title": "Find Subarrays With Equal Sum",
    "link": "https://leetcode.com/problems/find-subarrays-with-equal-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sum-of-subarray-minimums",
    "title": "Sum of Subarray Minimums",
    "link": "https://leetcode.com/problems/sum-of-subarray-minimums/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Stack",
    "patterns": [
      "Stack",
      "Monotonic Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-subarrays-with-fixed-bounds",
    "title": "Count Subarrays With Fixed Bounds",
    "link": "https://leetcode.com/problems/count-subarrays-with-fixed-bounds/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-sum-query-mutable",
    "title": "Range Sum Query - Mutable",
    "link": "https://leetcode.com/problems/range-sum-query-mutable/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Segment Tree",
    "patterns": [
      "Segment Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-query-kth-smallest-trimmed-number",
    "title": "Query Kth Smallest Trimmed Number",
    "link": "https://leetcode.com/problems/query-kth-smallest-trimmed-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-smallest-range-covering-elements-from-k-lists",
    "title": "Smallest Range Covering Elements from K Lists",
    "link": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-subarrays-with-odd-sum",
    "title": "Number of Subarrays with Odd Sum",
    "link": "https://leetcode.com/problems/count-number-of-subarrays-with-odd-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-submatrices-with-all-ones",
    "title": "Count Submatrices With All Ones",
    "link": "https://leetcode.com/problems/count-submatrices-with-all-ones/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-addition-ii",
    "title": "Range Addition II",
    "link": "https://leetcode.com/problems/range-addition-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-prefix-sum-array",
    "title": "Prefix Sum Array",
    "link": "https://www.geeksforgeeks.org/prefix-sum-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-range-update-queries",
    "title": "Range Update Queries",
    "link": "https://www.geeksforgeeks.org/range-update-queries-difference-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-subarray-sum-queries",
    "title": "Subarray Sum Queries",
    "link": "https://www.geeksforgeeks.org/subarray-sum-queries/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-of-subarrays-with-sum-exactly-equal-to-k",
    "title": "Count of subarrays with sum exactly equal to k",
    "link": "https://www.geeksforgeeks.org/count-subarrays-equal-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-subarray-with-given-sum",
    "title": "Find subarray with given sum",
    "link": "https://www.geeksforgeeks.org/find-subarray-with-given-sum/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-longest-subarray-with-sum-divisible-by-k",
    "title": "Longest subarray with sum divisible by k",
    "link": "https://www.geeksforgeeks.org/longest-subarray-sum-divisible-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-sum-subarray-of-size-k",
    "title": "Maximum sum subarray of size k",
    "link": "https://www.geeksforgeeks.org/maximum-sum-subarray-size-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-queries-on-subarray-sums",
    "title": "Queries on subarray sums",
    "link": "https://www.geeksforgeeks.org/queries-subarray-sums/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-subarrays-with-sum-divisible-by-k",
    "title": "Count subarrays with sum divisible by k",
    "link": "https://www.geeksforgeeks.org/count-subarrays-sum-divisible-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-array-can-be-divided-into-pairs-with-sum-divisible-by-k",
    "title": "Find if array can be divided into pairs with sum divisible by k",
    "link": "https://www.geeksforgeeks.org/check-if-array-can-be-divided-into-pairs-whose-sum-is-divisible-by-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-range-sum-queries-after-updates",
    "title": "Range sum queries after updates",
    "link": "https://www.geeksforgeeks.org/range-sum-query-after-update/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-number-of-subarrays-with-given-xor",
    "title": "Count number of subarrays with given XOR",
    "link": "https://www.geeksforgeeks.org/count-number-subarrays-given-xor/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-subarrays-having-sum-less-than-k",
    "title": "Count subarrays having sum less than K",
    "link": "https://www.geeksforgeeks.org/count-subarrays-having-sum-less-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-difference-array-and-its-applications",
    "title": "Difference array and its applications",
    "link": "https://www.geeksforgeeks.org/difference-array-range-update-query-o1/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-maximum-length-subarray-with-sum-k",
    "title": "Find maximum length subarray with sum k",
    "link": "https://www.geeksforgeeks.org/maximum-length-subarray-sum-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-subarrays-with-equal-number-of-0s-and-1s",
    "title": "Count subarrays with equal number of 0s and 1s",
    "link": "https://www.geeksforgeeks.org/count-subarrays-equal-number-0s-1s/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-subarrays-with-equal-number-of-0s-1s-and-2s",
    "title": "Count subarrays with equal number of 0s, 1s and 2s",
    "link": "https://www.geeksforgeeks.org/count-subarrays-equal-number-0s-1s-2s/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-queries-to-find-sum-of-even-and-odd-indexed-elements-in-a-range",
    "title": "Queries to find sum of even and odd indexed elements in a range",
    "link": "https://www.geeksforgeeks.org/queries-to-find-sum-of-even-and-odd-indexed-elements-in-a-range/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-subarrays-with-sum-zero",
    "title": "Find subarrays with sum zero",
    "link": "https://www.geeksforgeeks.org/find-subarrays-with-sum-zero/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-subarray-with-maximum-average",
    "title": "Find subarray with maximum average",
    "link": "https://www.geeksforgeeks.org/find-subarray-with-maximum-average/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Prefix Sum",
    "patterns": [
      "Prefix Sum"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-range-sum-query-using-fenwick-tree-binary-indexed-tree-",
    "title": "Range sum query using Fenwick Tree (Binary Indexed Tree)",
    "link": "https://www.geeksforgeeks.org/binary-indexed-tree-or-fenwick-tree-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Fenwick Tree",
    "patterns": [
      "Fenwick Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-sliding-window-maximum",
    "title": "Sliding Window Maximum",
    "link": "https://leetcode.com/problems/sliding-window-maximum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window",
      "Sliding Window Maximum",
      "Monotonic Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-permutation-in-string",
    "title": "Permutation in String",
    "link": "https://leetcode.com/problems/permutation-in-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-all-anagrams-in-a-string",
    "title": "Find All Anagrams in a String",
    "link": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-substring-with-concatenation-of-all-words",
    "title": "Substring with Concatenation of All Words",
    "link": "https://leetcode.com/problems/substring-with-concatenation-of-all-words/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-fruit-into-baskets",
    "title": "Fruit Into Baskets",
    "link": "https://leetcode.com/problems/fruit-into-baskets/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-number-of-vowels-in-a-substring-of-given-length",
    "title": "Maximum Number of Vowels in a Substring of Given Length",
    "link": "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-smallest-window-in-a-string-containing-all-characters-of-another-string",
    "title": "Smallest window in a string containing all characters of another string",
    "link": "https://www.geeksforgeeks.org/smallest-window-in-a-string-containing-all-characters-of-another-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-longest-substring-with-exactly-k-distinct-characters",
    "title": "Longest substring with exactly K distinct characters",
    "link": "https://www.geeksforgeeks.org/longest-substring-exactly-k-distinct-characters/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-occurrences-of-a-pattern-in-a-string",
    "title": "Count occurrences of a pattern in a string",
    "link": "https://www.geeksforgeeks.org/count-occurrences-of-a-pattern-in-a-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-of-all-subarrays-of-size-k",
    "title": "Maximum of all subarrays of size k",
    "link": "https://www.geeksforgeeks.org/maximum-of-all-subarrays-of-size-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-distinct-elements-in-every-window-of-size-k",
    "title": "Count distinct elements in every window of size k",
    "link": "https://www.geeksforgeeks.org/count-distinct-elements-in-every-window-of-size-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-number-of-substrings-with-exactly-k-distinct-characters",
    "title": "Count number of substrings with exactly k distinct characters",
    "link": "https://www.geeksforgeeks.org/count-number-of-substrings-with-exactly-k-distinct-characters/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-two-sum-ii-input-array-is-sorted",
    "title": "Two Sum II - Input array is sorted",
    "link": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-valid-palindrome",
    "title": "Valid Palindrome",
    "link": "https://leetcode.com/problems/valid-palindrome/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-string",
    "title": "Reverse String",
    "link": "https://leetcode.com/problems/reverse-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-squares-of-a-sorted-array",
    "title": "Squares of a Sorted Array",
    "link": "https://leetcode.com/problems/squares-of-a-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-partition-labels",
    "title": "Partition Labels",
    "link": "https://leetcode.com/problems/partition-labels/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-element",
    "title": "Remove Element",
    "link": "https://leetcode.com/problems/remove-element/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-words-in-a-string-iii",
    "title": "Reverse Words in a String III",
    "link": "https://leetcode.com/problems/reverse-words-in-a-string-iii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-two-pointer-technique-set-1-introduction-",
    "title": "Two Pointer Technique | Set 1 (Introduction)",
    "link": "https://www.geeksforgeeks.org/two-pointer-technique/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-there-is-a-triplet-in-array-whose-sum-is-zero",
    "title": "Find if there is a triplet in array whose sum is zero",
    "link": "https://www.geeksforgeeks.org/find-triplet-array-whose-sum-zero/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-merge-two-sorted-arrays-without-extra-space",
    "title": "Merge two sorted arrays without extra space",
    "link": "https://www.geeksforgeeks.org/merge-two-sorted-arrays-o1-extra-space/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-pairs-with-given-sum",
    "title": "Count pairs with given sum",
    "link": "https://www.geeksforgeeks.org/count-pairs-with-given-sum/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-dutch-national-flag-algorithm",
    "title": "Dutch National Flag Algorithm",
    "link": "https://www.geeksforgeeks.org/dutch-national-flag-problem-set-1-three-way-partitioning/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-pairs-with-given-sum-in-sorted-array",
    "title": "Find pairs with given sum in sorted array",
    "link": "https://www.geeksforgeeks.org/find-pairs-with-given-sum-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-pairs-with-difference-k",
    "title": "Count pairs with difference k",
    "link": "https://www.geeksforgeeks.org/count-pairs-difference-equal-k/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-move-all-negative-numbers-to-beginning",
    "title": "Move all negative numbers to beginning",
    "link": "https://www.geeksforgeeks.org/move-negative-numbers-beginning-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-minimum-window-sort",
    "title": "Minimum window sort",
    "link": "https://www.geeksforgeeks.org/find-minimum-length-unsorted-subarray-sorting-whole-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-remove-duplicates-from-unsorted-linked-list",
    "title": "Remove duplicates from unsorted linked list",
    "link": "https://www.geeksforgeeks.org/remove-duplicates-from-an-unsorted-linked-list/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-single-number-ii",
    "title": "Single Number II",
    "link": "https://leetcode.com/problems/single-number-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-counting-bits",
    "title": "Counting Bits",
    "link": "https://leetcode.com/problems/counting-bits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation",
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-bits",
    "title": "Reverse Bits",
    "link": "https://leetcode.com/problems/reverse-bits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-missing-number",
    "title": "Missing Number",
    "link": "https://leetcode.com/problems/missing-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-bitwise-and-of-numbers-range",
    "title": "Bitwise AND of Numbers Range",
    "link": "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-number-with-alternating-bits",
    "title": "Binary Number with Alternating Bits",
    "link": "https://leetcode.com/problems/binary-number-with-alternating-bits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-xor-of-two-numbers-in-an-array",
    "title": "Maximum XOR of Two Numbers in an Array",
    "link": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-complement-of-base-10-integer",
    "title": "Complement of Base 10 Integer",
    "link": "https://leetcode.com/problems/number-complement/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-total-hamming-distance",
    "title": "Total Hamming Distance",
    "link": "https://leetcode.com/problems/total-hamming-distance/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-gray-code",
    "title": "Gray Code",
    "link": "https://leetcode.com/problems/gray-code/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-bitwise-ors-of-subarrays",
    "title": "Bitwise ORs of Subarrays",
    "link": "https://leetcode.com/problems/bitwise-ors-of-subarrays/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-watch",
    "title": "Binary Watch",
    "link": "https://leetcode.com/problems/binary-watch/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-house-robber",
    "title": "House Robber",
    "link": "https://leetcode.com/problems/house-robber/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-coin-change",
    "title": "Coin Change",
    "link": "https://leetcode.com/problems/coin-change/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "Knapsack",
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-unique-paths",
    "title": "Unique Paths",
    "link": "https://leetcode.com/problems/unique-paths/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (2D/Grid)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-path-sum",
    "title": "Minimum Path Sum",
    "link": "https://leetcode.com/problems/minimum-path-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-edit-distance",
    "title": "Edit Distance",
    "link": "https://leetcode.com/problems/edit-distance/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (2D/Grid)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-word-break",
    "title": "Word Break",
    "link": "https://leetcode.com/problems/word-break/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (1D)",
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-combination-sum-iv",
    "title": "Combination Sum IV",
    "link": "https://leetcode.com/problems/combination-sum-iv/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-partition-equal-subset-sum",
    "title": "Partition Equal Subset Sum",
    "link": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "Knapsack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-distinct-subsequences",
    "title": "Distinct Subsequences",
    "link": "https://leetcode.com/problems/distinct-subsequences/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP on Subsequences"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-coin-change-2",
    "title": "Coin Change 2",
    "link": "https://leetcode.com/problems/coin-change-2/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-house-robber-ii",
    "title": "House Robber II",
    "link": "https://leetcode.com/problems/house-robber-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-interleaving-string",
    "title": "Interleaving String",
    "link": "https://leetcode.com/problems/interleaving-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP (2D/Grid)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-scramble-string",
    "title": "Scramble String",
    "link": "https://leetcode.com/problems/scramble-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-palindrome-partitioning-ii",
    "title": "Palindrome Partitioning II",
    "link": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-target-sum",
    "title": "Target Sum",
    "link": "https://leetcode.com/problems/target-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "Knapsack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-burst-balloons",
    "title": "Burst Balloons",
    "link": "https://leetcode.com/problems/burst-balloons/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-number-of-coins",
    "title": "Minimum Number of Coins",
    "link": "https://leetcode.com/problems/minimum-number-of-coins/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-arithmetic-subsequence",
    "title": "Longest Arithmetic Subsequence",
    "link": "https://leetcode.com/problems/longest-arithmetic-subsequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-different-palindromic-subsequences",
    "title": "Count Different Palindromic Subsequences",
    "link": "https://leetcode.com/problems/count-different-palindromic-subsequences/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-cost-for-tickets",
    "title": "Minimum Cost For Tickets",
    "link": "https://leetcode.com/problems/minimum-cost-for-tickets/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-palindrome-partitioning",
    "title": "Palindrome Partitioning",
    "link": "https://leetcode.com/problems/palindrome-partitioning/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-regular-expression-matching",
    "title": "Regular Expression Matching",
    "link": "https://leetcode.com/problems/regular-expression-matching/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-distinct-subsequences-ii",
    "title": "Distinct Subsequences II",
    "link": "https://leetcode.com/problems/distinct-subsequences-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-common-subsequence",
    "title": "Longest Common Subsequence",
    "link": "https://leetcode.com/problems/longest-common-subsequence/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming",
      "DP on Subsequences"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-0-1-knapsack-problem",
    "title": "0-1 Knapsack Problem",
    "link": "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-matrix-chain-multiplication",
    "title": "Matrix Chain Multiplication",
    "link": "https://www.geeksforgeeks.org/matrix-chain-multiplication-dp-8/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-egg-dropping-puzzle",
    "title": "Egg Dropping Puzzle",
    "link": "https://www.geeksforgeeks.org/egg-dropping-puzzle-dp-11/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-rod-cutting-problem",
    "title": "Rod Cutting Problem",
    "link": "https://www.geeksforgeeks.org/cutting-a-rod-dp-13/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-sum-increasing-subsequence",
    "title": "Maximum Sum Increasing Subsequence",
    "link": "https://www.geeksforgeeks.org/maximum-sum-increasing-subsequence-dp-14/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-ways-to-reach-the-nth-stair",
    "title": "Count Ways to Reach the Nth Stair",
    "link": "https://www.geeksforgeeks.org/count-ways-reach-nth-stair/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-product-subarray",
    "title": "Maximum Product Subarray",
    "link": "https://www.geeksforgeeks.org/maximum-product-subarray/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-longest-palindromic-substring",
    "title": "Longest Palindromic Substring",
    "link": "https://www.geeksforgeeks.org/longest-palindromic-substring-set-1/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-ways-to-cover-a-distance",
    "title": "Count Ways to Cover a Distance",
    "link": "https://www.geeksforgeeks.org/count-ways-to-cover-a-distance/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-longest-arithmetic-progression",
    "title": "Longest Arithmetic Progression",
    "link": "https://www.geeksforgeeks.org/longest-arithmetic-progression-dp-35/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-box-stacking-problem",
    "title": "Box Stacking Problem",
    "link": "https://www.geeksforgeeks.org/box-stacking-problem-dp-22/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-weighted-job-scheduling",
    "title": "Weighted Job Scheduling",
    "link": "https://www.geeksforgeeks.org/weighted-job-scheduling/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-all-palindromic-substrings",
    "title": "Count All Palindromic Substrings",
    "link": "https://www.geeksforgeeks.org/count-all-palindromic-substrings/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-maximum-length-chain-of-pairs",
    "title": "Maximum Length Chain of Pairs",
    "link": "https://www.geeksforgeeks.org/maximum-length-chain-of-pairs/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dynamic Programming",
    "patterns": [
      "Dynamic Programming"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-permutations",
    "title": "Permutations",
    "link": "https://leetcode.com/problems/permutations/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-subsets",
    "title": "Subsets",
    "link": "https://leetcode.com/problems/subsets/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-generate-parentheses",
    "title": "Generate Parentheses",
    "link": "https://leetcode.com/problems/generate-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-letter-combinations-of-a-phone-number",
    "title": "Letter Combinations of a Phone Number",
    "link": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-restore-ip-addresses",
    "title": "Restore IP Addresses",
    "link": "https://leetcode.com/problems/restore-ip-addresses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-letter-tile-possibilities",
    "title": "Letter Tile Possibilities",
    "link": "https://leetcode.com/problems/letter-tile-possibilities/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-numbers-with-unique-digits",
    "title": "Count Numbers with Unique Digits",
    "link": "https://leetcode.com/problems/count-numbers-with-unique-digits/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-remove-invalid-parentheses",
    "title": "Remove Invalid Parentheses",
    "link": "https://leetcode.com/problems/remove-invalid-parentheses/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-word-search-ii",
    "title": "Word Search II",
    "link": "https://leetcode.com/problems/word-search-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking",
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-unique-paths-iii",
    "title": "Unique Paths III",
    "link": "https://leetcode.com/problems/unique-paths-iii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-combination-sum-iii",
    "title": "Combination Sum III",
    "link": "https://leetcode.com/problems/combination-sum-iii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-beautiful-arrangement",
    "title": "Beautiful Arrangement",
    "link": "https://leetcode.com/problems/beautiful-arrangement/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-generate-binary-numbers",
    "title": "Generate Binary Numbers",
    "link": "https://leetcode.com/problems/generate-binary-numbers/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-subsets-of-a-set",
    "title": "Print all subsets of a set",
    "link": "https://www.geeksforgeeks.org/find-subsets-set-2-bitwise-operations/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-possible-words-from-phone-digits",
    "title": "Print all possible words from phone digits",
    "link": "https://www.geeksforgeeks.org/print-possible-words-phone-digits/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-there-is-a-path-of-more-than-k-length-from-a-source",
    "title": "Find if there is a path of more than k length from a source",
    "link": "https://www.geeksforgeeks.org/find-if-there-is-a-path-of-more-than-k-length-from-a-source/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-permutations-of-a-string-with-duplicates",
    "title": "Find all permutations of a string with duplicates",
    "link": "https://www.geeksforgeeks.org/print-distinct-permutations-string/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-valid-parentheses-combinations",
    "title": "Print all valid parentheses combinations",
    "link": "https://www.geeksforgeeks.org/print-all-combinations-of-balanced-parentheses/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-all-possible-paths-from-top-left-to-bottom-right-of-a-mxn-matrix",
    "title": "Count all possible paths from top left to bottom right of a mXn matrix",
    "link": "https://www.geeksforgeeks.org/count-possible-paths-top-left-bottom-right-nxm-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-word-break-problem-using-backtracking",
    "title": "Word Break Problem using Backtracking",
    "link": "https://www.geeksforgeeks.org/word-break-problem-using-backtracking/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-possible-binary-strings-of-length-n",
    "title": "Print all possible binary strings of length n",
    "link": "https://www.geeksforgeeks.org/print-binary-strings-without-consecutive-1s/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-generate-all-possible-unique-subsets",
    "title": "Generate all possible unique subsets",
    "link": "https://www.geeksforgeeks.org/find-subsets-set-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-paths-from-source-to-destination-in-a-graph",
    "title": "Find all paths from source to destination in a graph",
    "link": "https://www.geeksforgeeks.org/find-paths-given-source-destination/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-all-possible-strings-after-removing-k-characters",
    "title": "Find all possible strings after removing k characters",
    "link": "https://www.geeksforgeeks.org/find-all-possible-strings-after-removing-k-characters/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-all-possible-sentences-from-a-dictionary",
    "title": "Print all possible sentences from a dictionary",
    "link": "https://www.geeksforgeeks.org/print-all-possible-sentences-from-a-dictionary/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-peak-index-in-a-mountain-array",
    "title": "Peak Index in a Mountain Array",
    "link": "https://leetcode.com/problems/peak-index-in-a-mountain-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-median-of-two-sorted-arrays",
    "title": "Median of Two Sorted Arrays",
    "link": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-k-th-smallest-pair-distance",
    "title": "Find K-th Smallest Pair Distance",
    "link": "https://leetcode.com/problems/find-k-th-smallest-pair-distance/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-capacity-to-ship-packages-within-d-days",
    "title": "Capacity To Ship Packages Within D Days",
    "link": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search",
      "Binary Search on Answer"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-smallest-divisor-given-a-threshold",
    "title": "Find the Smallest Divisor Given a Threshold",
    "link": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-search-a-2d-matrix-ii",
    "title": "Search a 2D Matrix II",
    "link": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-kth-missing-positive-number",
    "title": "Kth Missing Positive Number",
    "link": "https://leetcode.com/problems/kth-missing-positive-number/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-first-and-last-position-of-element-in-sorted-array",
    "title": "Find First and Last Position of Element in Sorted Array",
    "link": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-search-tree-iterator",
    "title": "Binary Search Tree Iterator",
    "link": "https://leetcode.com/problems/binary-search-tree-iterator/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-search-in-a-sorted-array-of-unknown-size",
    "title": "Search in a Sorted Array of Unknown Size",
    "link": "https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-negative-numbers-in-a-sorted-matrix",
    "title": "Count Negative Numbers in a Sorted Matrix",
    "link": "https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-closest-number-to-zero",
    "title": "Find the Closest Number to Zero",
    "link": "https://leetcode.com/problems/find-the-closest-number-to-zero/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-right-interval",
    "title": "Find Right Interval",
    "link": "https://leetcode.com/problems/find-right-interval/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-linear-search",
    "title": "Linear Search",
    "link": "https://www.geeksforgeeks.org/linear-search/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Linear Search",
    "patterns": [
      "Linear Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-order-agnostic-binary-search",
    "title": "Order-agnostic Binary Search",
    "link": "https://www.geeksforgeeks.org/order-agnostic-binary-search/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-occurrences-of-an-element-in-a-sorted-array",
    "title": "Count occurrences of an element in a sorted array",
    "link": "https://www.geeksforgeeks.org/count-occurrences-of-an-element-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-floor-of-an-element-in-a-sorted-array",
    "title": "Find the floor of an element in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-floor-and-ceil-from-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-rotation-count-in-a-rotated-sorted-array",
    "title": "Find the rotation count in a rotated sorted array",
    "link": "https://www.geeksforgeeks.org/find-rotation-count-rotated-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-smallest-letter-greater-than-target",
    "title": "Find smallest letter greater than target",
    "link": "https://www.geeksforgeeks.org/find-smallest-letter-greater-than-target/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-index-of-first-1-in-a-binary-sorted-array",
    "title": "Find the index of first 1 in a binary sorted array",
    "link": "https://www.geeksforgeeks.org/find-first-1-in-a-binary-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-search-in-an-infinite-sorted-array",
    "title": "Search in an infinite sorted array",
    "link": "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-closest-number-in-a-sorted-array",
    "title": "Find the closest number in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-closest-number-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-element-that-appears-once-in-a-sorted-array",
    "title": "Find the element that appears once in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-the-element-that-appears-once-in-a-sorted-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-kth-smallest-element-in-a-sorted-matrix",
    "title": "Find the kth smallest element in a sorted matrix",
    "link": "https://www.geeksforgeeks.org/kth-smallest-element-in-a-sorted-matrix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-missing-number-in-an-arithmetic-progression",
    "title": "Find the missing number in an arithmetic progression",
    "link": "https://www.geeksforgeeks.org/find-missing-number-arithmetic-progression/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-closest-pair-to-a-given-sum-in-a-sorted-array",
    "title": "Find the closest pair to a given sum in a sorted array",
    "link": "https://www.geeksforgeeks.org/find-pair-array-whose-sum-closest-given-number/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-first-non-repeating-element-in-an-array",
    "title": "Find the first non-repeating element in an array",
    "link": "https://www.geeksforgeeks.org/find-first-non-repeating-element-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-the-kth-largest-element-in-an-array",
    "title": "Find the kth largest element in an array",
    "link": "https://www.geeksforgeeks.org/kth-largest-element-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Quickselect",
    "patterns": [
      "Quickselect"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-search-in-a-bitonic-array",
    "title": "Search in a bitonic array",
    "link": "https://www.geeksforgeeks.org/search-element-bitonic-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-inorder-traversal",
    "title": "Binary Tree Inorder Traversal",
    "link": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-preorder-traversal",
    "title": "Binary Tree Preorder Traversal",
    "link": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-postorder-traversal",
    "title": "Binary Tree Postorder Traversal",
    "link": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "link": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree",
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-symmetric-tree",
    "title": "Symmetric Tree",
    "link": "https://leetcode.com/problems/symmetric-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-balanced-binary-tree",
    "title": "Balanced Binary Tree",
    "link": "https://leetcode.com/problems/balanced-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree",
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "link": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree",
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-flatten-binary-tree-to-linked-list",
    "title": "Flatten Binary Tree to Linked List",
    "link": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-lowest-common-ancestor-of-a-binary-tree",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "link": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree",
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-construct-binary-tree-from-preorder-and-inorder-traversal",
    "title": "Construct Binary Tree from Preorder and Inorder Traversal",
    "link": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree",
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "link": "https://leetcode.com/problems/validate-binary-search-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree",
      "BST"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-convert-sorted-array-to-binary-search-tree",
    "title": "Convert Sorted Array to Binary Search Tree",
    "link": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-lowest-common-ancestor-of-a-bst",
    "title": "Lowest Common Ancestor of a BST",
    "link": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree",
      "BST"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-recover-binary-search-tree",
    "title": "Recover Binary Search Tree",
    "link": "https://leetcode.com/problems/recover-binary-search-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-insert-into-a-binary-search-tree",
    "title": "Insert into a Binary Search Tree",
    "link": "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-delete-node-in-a-bst",
    "title": "Delete Node in a BST",
    "link": "https://leetcode.com/problems/delete-node-in-a-bst/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-range-sum-query-2d-mutable",
    "title": "Range Sum Query 2D - Mutable",
    "link": "https://leetcode.com/problems/range-sum-query-2d-mutable/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Segment Tree",
    "patterns": [
      "Segment Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-implement-trie-prefix-tree-",
    "title": "Implement Trie (Prefix Tree)",
    "link": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-add-and-search-word-data-structure-design",
    "title": "Add and Search Word - Data structure design",
    "link": "https://leetcode.com/problems/add-and-search-word-data-structure-design/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-replace-words",
    "title": "Replace Words",
    "link": "https://leetcode.com/problems/replace-words/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-median-from-data-stream",
    "title": "Find Median from Data Stream",
    "link": "https://leetcode.com/problems/find-median-from-data-stream/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Heap",
    "patterns": [
      "Heap",
      "Heap/Priority Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reorganize-string",
    "title": "Reorganize String",
    "link": "https://leetcode.com/problems/reorganize-string/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-last-stone-weight",
    "title": "Last Stone Weight",
    "link": "https://leetcode.com/problems/last-stone-weight/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Heap",
    "patterns": [
      "Heap",
      "Heap/Priority Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-design-twitter",
    "title": "Design Twitter",
    "link": "https://leetcode.com/problems/design-twitter/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap",
      "Top-K / K-way Merge",
      "Heap/Priority Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-two-trees-are-identical",
    "title": "Check if Two Trees are Identical",
    "link": "https://www.geeksforgeeks.org/write-c-code-to-determine-if-two-trees-are-identical/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "Binary Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-kth-smallest-largest-element-in-bst",
    "title": "Find kth Smallest/Largest Element in BST",
    "link": "https://www.geeksforgeeks.org/kth-smallest-element-in-bst/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-bst-iterator",
    "title": "BST Iterator",
    "link": "https://www.geeksforgeeks.org/inorder-successor-in-binary-search-tree/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search Tree",
    "patterns": [
      "Binary Search Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-avl-tree-insert",
    "title": "AVL Tree Insert",
    "link": "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "AVL Tree",
    "patterns": [
      "AVL Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-avl-tree-delete",
    "title": "AVL Tree Delete",
    "link": "https://www.geeksforgeeks.org/avl-tree-set-2-deletion/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "AVL Tree",
    "patterns": [
      "AVL Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-construct-segment-tree-for-sum",
    "title": "Construct Segment Tree for Sum",
    "link": "https://www.geeksforgeeks.org/segment-tree-set-1-sum-of-given-range/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Segment Tree",
    "patterns": [
      "Segment Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-range-minimum-query-using-segment-tree",
    "title": "Range Minimum Query using Segment Tree",
    "link": "https://www.geeksforgeeks.org/segment-tree-set-2-range-minimum-query/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Segment Tree",
    "patterns": [
      "Segment Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-lazy-propagation-in-segment-tree",
    "title": "Lazy Propagation in Segment Tree",
    "link": "https://www.geeksforgeeks.org/lazy-propagation-in-segment-tree/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Segment Tree",
    "patterns": [
      "Segment Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-trie-count-words-with-given-prefix",
    "title": "Trie - Count Words with Given Prefix",
    "link": "https://www.geeksforgeeks.org/trie-count-words-with-given-prefix/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-print-auto-suggestions",
    "title": "Print Auto-suggestions",
    "link": "https://www.geeksforgeeks.org/auto-complete-feature-using-trie/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-build-a-heap-from-array",
    "title": "Build a Heap from Array",
    "link": "https://www.geeksforgeeks.org/building-heap-from-array/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-merge-k-sorted-arrays-using-heap",
    "title": "Merge K Sorted Arrays using Heap",
    "link": "https://www.geeksforgeeks.org/merge-k-sorted-arrays/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Heap",
    "patterns": [
      "Heap"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-clone-graph",
    "title": "Clone Graph",
    "link": "https://leetcode.com/problems/clone-graph/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS",
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-graph-valid-tree",
    "title": "Graph Valid Tree",
    "link": "https://leetcode.com/problems/graph-valid-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS",
      "Union-Find/DSU"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-all-paths-from-source-to-target",
    "title": "All Paths From Source to Target",
    "link": "https://leetcode.com/problems/all-paths-from-source-to-target/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-connected-components-in-an-undirected-graph",
    "title": "Number of Connected Components in an Undirected Graph",
    "link": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS",
      "Union-Find/DSU"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-eventual-safe-states",
    "title": "Find Eventual Safe States",
    "link": "https://leetcode.com/problems/find-eventual-safe-states/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-increasing-path-in-a-matrix",
    "title": "Longest Increasing Path in a Matrix",
    "link": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "DFS",
    "patterns": [
      "DFS",
      "DP (2D/Grid)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-depth-of-binary-tree",
    "title": "Minimum Depth of Binary Tree",
    "link": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-word-ladder",
    "title": "Word Ladder",
    "link": "https://leetcode.com/problems/word-ladder/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-rotting-oranges",
    "title": "Rotting Oranges",
    "link": "https://leetcode.com/problems/rotting-oranges/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-shortest-path-in-binary-matrix",
    "title": "Shortest Path in Binary Matrix",
    "link": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-open-the-lock",
    "title": "Open the Lock",
    "link": "https://leetcode.com/problems/open-the-lock/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-walls-and-gates",
    "title": "Walls and Gates",
    "link": "https://leetcode.com/problems/walls-and-gates/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-01-matrix",
    "title": "01 Matrix",
    "link": "https://leetcode.com/problems/01-matrix/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-cheapest-flights-within-k-stops",
    "title": "Cheapest Flights Within K Stops",
    "link": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra",
      "Bellman-Ford",
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
    "title": "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
    "link": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-bus-routes",
    "title": "Bus Routes",
    "link": "https://leetcode.com/problems/bus-routes/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-network-delay-time",
    "title": "Network Delay Time",
    "link": "https://leetcode.com/problems/network-delay-time/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-path-with-minimum-effort",
    "title": "Path With Minimum Effort",
    "link": "https://leetcode.com/problems/path-with-minimum-effort/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-swim-in-rising-water",
    "title": "Swim in Rising Water",
    "link": "https://leetcode.com/problems/swim-in-rising-water/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra",
      "Binary Search on Answer"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-network-delay-time-ii",
    "title": "Network Delay Time II",
    "link": "https://leetcode.com/problems/network-delay-time-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-minimum-spanning-tree",
    "title": "Minimum Spanning Tree",
    "link": "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree",
      "MST (Kruskal/Prim)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-connecting-cities-with-minimum-cost",
    "title": "Connecting Cities With Minimum Cost",
    "link": "https://leetcode.com/problems/connecting-cities-with-minimum-cost/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-redundant-connection",
    "title": "Redundant Connection",
    "link": "https://leetcode.com/problems/redundant-connection/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree",
      "Union-Find/DSU"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general",
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-redundant-connection-ii",
    "title": "Redundant Connection II",
    "link": "https://leetcode.com/problems/redundant-connection-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-optimize-water-distribution-in-a-village",
    "title": "Optimize Water Distribution in a Village",
    "link": "https://leetcode.com/problems/optimize-water-distribution-in-a-village/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-satisfiability-of-equality-equations",
    "title": "Satisfiability of Equality Equations",
    "link": "https://leetcode.com/problems/satisfiability-of-equality-equations/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Union Find",
    "patterns": [
      "Union Find"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-number-of-operations-to-make-network-connected",
    "title": "Number of Operations to Make Network Connected",
    "link": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Union Find",
    "patterns": [
      "Union Find"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-accounts-merge",
    "title": "Accounts Merge",
    "link": "https://leetcode.com/problems/accounts-merge/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Union Find",
    "patterns": [
      "Union Find"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-dfs-of-graph",
    "title": "DFS of Graph",
    "link": "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-detect-cycle-in-undirected-graph",
    "title": "Detect Cycle in Undirected Graph",
    "link": "https://www.geeksforgeeks.org/detect-cycle-undirected-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-mother-vertex-in-graph",
    "title": "Find Mother Vertex in Graph",
    "link": "https://www.geeksforgeeks.org/find-a-mother-vertex-in-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-count-trees-in-a-forest",
    "title": "Count Trees in a Forest",
    "link": "https://www.geeksforgeeks.org/count-trees-forest-using-dfs/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-graph-is-strongly-connected",
    "title": "Check if Graph is Strongly Connected",
    "link": "https://www.geeksforgeeks.org/strongly-connected-components/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-bridges-in-a-graph",
    "title": "Find Bridges in a Graph",
    "link": "https://www.geeksforgeeks.org/bridge-in-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-articulation-points-in-a-graph",
    "title": "Articulation Points in a Graph",
    "link": "https://www.geeksforgeeks.org/articulation-points-or-cut-vertices-in-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-bfs-of-graph",
    "title": "BFS of Graph",
    "link": "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-shortest-path-in-undirected-graph",
    "title": "Shortest Path in Undirected Graph",
    "link": "https://www.geeksforgeeks.org/shortest-path-unweighted-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-shortest-distance-in-a-maze",
    "title": "Find Shortest Distance in a Maze",
    "link": "https://www.geeksforgeeks.org/shortest-distance-in-a-binary-maze/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-shortest-path-in-directed-acyclic-graph-dag-",
    "title": "Shortest Path in Directed Acyclic Graph (DAG)",
    "link": "https://www.geeksforgeeks.org/shortest-path-in-directed-acyclic-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-graph-is-bipartite",
    "title": "Check if Graph is Bipartite",
    "link": "https://www.geeksforgeeks.org/bipartite-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-cycle-detection-in-undirected-graph-using-bfs",
    "title": "Cycle Detection in Undirected Graph using BFS",
    "link": "https://www.geeksforgeeks.org/detect-cycle-undirected-graph-bfs/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-find-if-path-exists-in-graph",
    "title": "Find if Path Exists in Graph",
    "link": "https://www.geeksforgeeks.org/find-if-path-exists-in-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-dijkstra-s-shortest-path-algorithm",
    "title": "Dijkstra's shortest path Algorithm",
    "link": "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-implementing-dijkstra-using-priority-queue",
    "title": "Implementing Dijkstra using Priority Queue",
    "link": "https://www.geeksforgeeks.org/implementing-dijkstra-algorithm-for-adjacency-list-using-priority_queue-in-cpp/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-shortest-path-in-weighted-graph",
    "title": "Shortest Path in Weighted Graph",
    "link": "https://www.geeksforgeeks.org/shortest-path-in-a-directed-graph-with-positive-weights/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Dijkstra",
    "patterns": [
      "Dijkstra"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-prim-s-minimum-spanning-tree-mst-",
    "title": "Prim's Minimum Spanning Tree (MST)",
    "link": "https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-kruskal-s-minimum-spanning-tree-algorithm",
    "title": "Kruskal's Minimum Spanning Tree Algorithm",
    "link": "https://www.geeksforgeeks.org/kruskals-minimum-spanning-tree-algorithm-greedy-algo-2/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-union-find-algorithm",
    "title": "Union Find Algorithm",
    "link": "https://www.geeksforgeeks.org/union-find-algorithm-set-2-union-by-rank/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Union Find",
    "patterns": [
      "Union Find"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-detect-cycle-in-undirected-graph-using-disjoint-set",
    "title": "Detect Cycle in Undirected Graph using Disjoint Set",
    "link": "https://www.geeksforgeeks.org/detect-cycle-undirected-graph-using-disjoint-set/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Union Find",
    "patterns": [
      "Union Find"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-check-if-mst-is-unique",
    "title": "Check if MST is Unique",
    "link": "https://www.geeksforgeeks.org/check-if-mst-is-unique/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-reverse-delete-algorithm-for-mst",
    "title": "Reverse Delete Algorithm for MST",
    "link": "https://www.geeksforgeeks.org/reverse-delete-algorithm-minimum-spanning-tree/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Minimum Spanning Tree",
    "patterns": [
      "Minimum Spanning Tree"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-detect-cycle-in-directed-graph",
    "title": "Detect Cycle in Directed Graph",
    "link": "https://www.geeksforgeeks.org/detect-cycle-in-a-directed-graph-using-dfs/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-kahn-s-algorithm-for-topological-sorting",
    "title": "Kahn’s Algorithm for Topological Sorting",
    "link": "https://www.geeksforgeeks.org/topological-sorting-indegree-based-solution/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-bellman-ford-algorithm",
    "title": "Bellman Ford Algorithm",
    "link": "https://www.geeksforgeeks.org/bellman-ford-algorithm-dp-23/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Shortest Path",
    "patterns": [
      "Shortest Path"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-floyd-warshall-algorithm",
    "title": "Floyd Warshall Algorithm",
    "link": "https://www.geeksforgeeks.org/floyd-warshall-algorithm-dp-16/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Shortest Path",
    "patterns": [
      "Shortest Path"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-union-find-disjoint-set-union-",
    "title": "Union Find (Disjoint Set Union)",
    "link": "https://www.geeksforgeeks.org/disjoint-set-data-structures/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Disjoint Set",
    "patterns": [
      "Disjoint Set"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-number-of-connected-components-in-a-graph",
    "title": "Number of Connected Components in a Graph",
    "link": "https://www.geeksforgeeks.org/connected-components-in-an-undirected-graph/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-largest-sum-contiguous-subarray",
    "title": "Largest Sum Contiguous Subarray",
    "link": "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "Kadane's Algorithm"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-circular-subarray-sum",
    "title": "Circular Subarray Sum",
    "link": "https://leetcode.com/problems/maximum-sum-circular-subarray/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "Kadane's Algorithm"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "general"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-4sum",
    "title": "4Sum",
    "link": "https://leetcode.com/problems/4sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-koko-eating-bananas",
    "title": "Koko Eating Bananas",
    "link": "https://leetcode.com/problems/koko-eating-bananas/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search on Answer",
    "patterns": [
      "Binary Search on Answer"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-single-element-in-a-sorted-array",
    "title": "Single Element in a Sorted Array",
    "link": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-asteroid-collision",
    "title": "Asteroid Collision",
    "link": "https://leetcode.com/problems/asteroid-collision/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Stack",
    "patterns": [
      "Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-car-fleet",
    "title": "Car Fleet",
    "link": "https://leetcode.com/problems/car-fleet/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Monotonic Stack",
    "patterns": [
      "Monotonic Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-online-stock-span",
    "title": "Online Stock Span",
    "link": "https://leetcode.com/problems/online-stock-span/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Monotonic Stack",
    "patterns": [
      "Monotonic Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-maximal-rectangle",
    "title": "Maximal Rectangle",
    "link": "https://leetcode.com/problems/maximal-rectangle/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Monotonic Stack",
    "patterns": [
      "Monotonic Stack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-reverse-nodes-in-k-group",
    "title": "Reverse Nodes in k-Group",
    "link": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Linked List",
    "patterns": [
      "Linked List"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-lru-cache",
    "title": "LRU Cache",
    "link": "https://leetcode.com/problems/lru-cache/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Doubly Linked List",
    "patterns": [
      "Doubly Linked List",
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-lfu-cache",
    "title": "LFU Cache",
    "link": "https://leetcode.com/problems/lfu-cache/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Doubly Linked List",
    "patterns": [
      "Doubly Linked List",
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-invert-binary-tree",
    "title": "Invert Binary Tree",
    "link": "https://leetcode.com/problems/invert-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-diameter-of-binary-tree",
    "title": "Diameter of Binary Tree",
    "link": "https://leetcode.com/problems/diameter-of-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-same-tree",
    "title": "Same Tree",
    "link": "https://leetcode.com/problems/same-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-subtree-of-another-tree",
    "title": "Subtree of Another Tree",
    "link": "https://leetcode.com/problems/subtree-of-another-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-right-side-view",
    "title": "Binary Tree Right Side View",
    "link": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-count-good-nodes-in-binary-tree",
    "title": "Count Good Nodes in Binary Tree",
    "link": "https://leetcode.com/problems/count-good-nodes-in-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-kth-smallest-element-in-a-bst",
    "title": "Kth Smallest Element in a BST",
    "link": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "BST",
    "patterns": [
      "BST"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-binary-tree-maximum-path-sum",
    "title": "Binary Tree Maximum Path Sum",
    "link": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Tree",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-serialize-and-deserialize-binary-tree",
    "title": "Serialize and Deserialize Binary Tree",
    "link": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Binary Tree",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-design-add-and-search-words-data-structure",
    "title": "Design Add and Search Words Data Structure",
    "link": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Trie",
    "patterns": [
      "Trie"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-kth-largest-element-in-a-stream",
    "title": "Kth Largest Element in a Stream",
    "link": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Heap",
    "patterns": [
      "Heap/Priority Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-k-closest-points-to-origin",
    "title": "K Closest Points to Origin",
    "link": "https://leetcode.com/problems/k-closest-points-to-origin/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Top-K / K-way Merge",
    "patterns": [
      "Top-K / K-way Merge",
      "Heap/Priority Queue"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-task-scheduler",
    "title": "Task Scheduler",
    "link": "https://leetcode.com/problems/task-scheduler/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Heap",
    "patterns": [
      "Heap/Priority Queue",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-max-area-of-island",
    "title": "Max Area of Island",
    "link": "https://leetcode.com/problems/max-area-of-island/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-min-cost-climbing-stairs",
    "title": "Min Cost Climbing Stairs",
    "link": "https://leetcode.com/problems/min-cost-climbing-stairs/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "DP (1D)",
    "patterns": [
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-longest-palindromic-substring",
    "title": "Longest Palindromic Substring",
    "link": "https://leetcode.com/problems/longest-palindromic-substring/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DP (1D)",
    "patterns": [
      "DP (1D)",
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-palindromic-substrings",
    "title": "Palindromic Substrings",
    "link": "https://leetcode.com/problems/palindromic-substrings/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DP (1D)",
    "patterns": [
      "DP (1D)",
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-best-time-to-buy-and-sell-stock-with-cooldown",
    "title": "Best Time to Buy and Sell Stock with Cooldown",
    "link": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DP (1D)",
    "patterns": [
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-coin-change-ii",
    "title": "Coin Change II",
    "link": "https://leetcode.com/problems/coin-change-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Knapsack",
    "patterns": [
      "Knapsack"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-jump-game",
    "title": "Jump Game",
    "link": "https://leetcode.com/problems/jump-game/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-jump-game-ii",
    "title": "Jump Game II",
    "link": "https://leetcode.com/problems/jump-game-ii/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-gas-station",
    "title": "Gas Station",
    "link": "https://leetcode.com/problems/gas-station/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-hand-of-straights",
    "title": "Hand of Straights",
    "link": "https://leetcode.com/problems/hand-of-straights/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-n-meetings-in-one-room",
    "title": "N-meetings in one room",
    "link": "https://www.geeksforgeeks.org/n-meetings-in-one-room/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Interval Scheduling / Merge Intervals",
    "patterns": [
      "Interval Scheduling / Merge Intervals",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-minimum-platforms",
    "title": "Minimum Platforms",
    "link": "https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Interval Scheduling / Merge Intervals",
    "patterns": [
      "Interval Scheduling / Merge Intervals",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "gfg-job-sequencing-problem",
    "title": "Job Sequencing Problem",
    "link": "https://www.geeksforgeeks.org/job-sequencing-problem/",
    "source": "gfg",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "striver-sde"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "leetcode-non-overlapping-intervals",
    "title": "Non-overlapping Intervals",
    "link": "https://leetcode.com/problems/non-overlapping-intervals/",
    "source": "leetcode",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Interval Scheduling / Merge Intervals",
    "patterns": [
      "Interval Scheduling / Merge Intervals",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "neetcode-150",
      "blind-75"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-watermelon",
    "title": "Watermelon",
    "link": "https://codeforces.com/problemset/problem/4/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-way-too-long-words",
    "title": "Way Too Long Words",
    "link": "https://codeforces.com/problemset/problem/71/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-team",
    "title": "Team",
    "link": "https://codeforces.com/problemset/problem/231/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-next-round",
    "title": "Next Round",
    "link": "https://codeforces.com/problemset/problem/158/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-domino-piling",
    "title": "Domino piling",
    "link": "https://codeforces.com/problemset/problem/50/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-bit-",
    "title": "Bit++",
    "link": "https://codeforces.com/problemset/problem/282/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-petya-and-strings",
    "title": "Petya and Strings",
    "link": "https://codeforces.com/problemset/problem/112/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-helpful-maths",
    "title": "Helpful Maths",
    "link": "https://codeforces.com/problemset/problem/339/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Sorting",
    "patterns": [
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-word-capitalization",
    "title": "Word Capitalization",
    "link": "https://codeforces.com/problemset/problem/281/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-boy-or-girl",
    "title": "Boy or Girl",
    "link": "https://codeforces.com/problemset/problem/236/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-stones-on-the-table",
    "title": "Stones on the Table",
    "link": "https://codeforces.com/problemset/problem/266/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-elephant",
    "title": "Elephant",
    "link": "https://codeforces.com/problemset/problem/617/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-soldier-and-bananas",
    "title": "Soldier and Bananas",
    "link": "https://codeforces.com/problemset/problem/546/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-bear-and-big-brother",
    "title": "Bear and Big Brother",
    "link": "https://codeforces.com/problemset/problem/791/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-wrong-subtraction",
    "title": "Wrong Subtraction",
    "link": "https://codeforces.com/problemset/problem/977/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-nearly-lucky-number",
    "title": "Nearly Lucky Number",
    "link": "https://codeforces.com/problemset/problem/110/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-anton-and-danik",
    "title": "Anton and Danik",
    "link": "https://codeforces.com/problemset/problem/734/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-translation",
    "title": "Translation",
    "link": "https://codeforces.com/problemset/problem/41/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-vanya-and-fence",
    "title": "Vanya and Fence",
    "link": "https://codeforces.com/problemset/problem/677/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-beautiful-year",
    "title": "Beautiful Year",
    "link": "https://codeforces.com/problemset/problem/271/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-in-search-of-an-easy-problem",
    "title": "In Search of an Easy Problem",
    "link": "https://codeforces.com/problemset/problem/1030/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-george-and-accommodation",
    "title": "George and Accommodation",
    "link": "https://codeforces.com/problemset/problem/467/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-presents",
    "title": "Presents",
    "link": "https://codeforces.com/problemset/problem/136/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-magnets",
    "title": "Magnets",
    "link": "https://codeforces.com/problemset/problem/344/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-calculating-function",
    "title": "Calculating Function",
    "link": "https://codeforces.com/problemset/problem/486/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-drinks",
    "title": "Drinks",
    "link": "https://codeforces.com/problemset/problem/200/B",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-is-your-horseshoe-on-the-other-hoof-",
    "title": "Is your horseshoe on the other hoof?",
    "link": "https://codeforces.com/problemset/problem/228/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-i-wanna-be-the-guy",
    "title": "I Wanna Be the Guy",
    "link": "https://codeforces.com/problemset/problem/469/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-divisibility-problem",
    "title": "Divisibility Problem",
    "link": "https://codeforces.com/problemset/problem/1328/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-fox-and-snake",
    "title": "Fox And Snake",
    "link": "https://codeforces.com/problemset/problem/510/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Matrix Traversal",
    "patterns": [
      "Matrix Traversal"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-hit-the-lottery",
    "title": "Hit the Lottery",
    "link": "https://codeforces.com/problemset/problem/996/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-pangram",
    "title": "Pangram",
    "link": "https://codeforces.com/problemset/problem/520/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-hulk",
    "title": "Hulk",
    "link": "https://codeforces.com/problemset/problem/705/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-chat-room",
    "title": "Chat room",
    "link": "https://codeforces.com/problemset/problem/58/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-young-physicist",
    "title": "Young Physicist",
    "link": "https://codeforces.com/problemset/problem/69/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-lucky-division",
    "title": "Lucky Division",
    "link": "https://codeforces.com/problemset/problem/122/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-hq9-",
    "title": "HQ9+",
    "link": "https://codeforces.com/problemset/problem/133/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-twins",
    "title": "Twins",
    "link": "https://codeforces.com/problemset/problem/160/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Greedy",
    "patterns": [
      "Greedy",
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-even-odds",
    "title": "Even Odds",
    "link": "https://codeforces.com/problemset/problem/318/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-expression",
    "title": "Expression",
    "link": "https://codeforces.com/problemset/problem/479/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-kefa-and-first-steps",
    "title": "Kefa and First Steps",
    "link": "https://codeforces.com/problemset/problem/580/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "DP (1D)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "codeforces-caps-lock",
    "title": "cAPS lOCK",
    "link": "https://codeforces.com/problemset/problem/131/A",
    "source": "codeforces",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "codeforces-classic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-weird-algorithm",
    "title": "Weird Algorithm",
    "link": "https://cses.fi/problemset/task/1068",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-missing-number",
    "title": "Missing Number",
    "link": "https://cses.fi/problemset/task/1083",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-repetitions",
    "title": "Repetitions",
    "link": "https://cses.fi/problemset/task/1069",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-increasing-array",
    "title": "Increasing Array",
    "link": "https://cses.fi/problemset/task/1094",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-permutations",
    "title": "Permutations",
    "link": "https://cses.fi/problemset/task/1070",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-number-spiral",
    "title": "Number Spiral",
    "link": "https://cses.fi/problemset/task/1071",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-two-knights",
    "title": "Two Knights",
    "link": "https://cses.fi/problemset/task/1072",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-two-sets",
    "title": "Two Sets",
    "link": "https://cses.fi/problemset/task/1092",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-bit-strings",
    "title": "Bit Strings",
    "link": "https://cses.fi/problemset/task/1617",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Number Theory (GCD/Sieve)",
    "patterns": [
      "Number Theory (GCD/Sieve)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-trailing-zeros",
    "title": "Trailing Zeros",
    "link": "https://cses.fi/problemset/task/1618",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-coin-piles",
    "title": "Coin Piles",
    "link": "https://cses.fi/problemset/task/1754",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-palindrome-reorder",
    "title": "Palindrome Reorder",
    "link": "https://cses.fi/problemset/task/1755",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-gray-code",
    "title": "Gray Code",
    "link": "https://cses.fi/problemset/task/2205",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bit Manipulation",
    "patterns": [
      "Bit Manipulation"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-tower-of-hanoi",
    "title": "Tower of Hanoi",
    "link": "https://cses.fi/problemset/task/2165",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Recursion",
    "patterns": [
      "Recursion"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-creating-strings",
    "title": "Creating Strings",
    "link": "https://cses.fi/problemset/task/1622",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-apple-division",
    "title": "Apple Division",
    "link": "https://cses.fi/problemset/task/1623",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Recursion",
    "patterns": [
      "Bitmask DP"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-chessboard-and-queens",
    "title": "Chessboard and Queens",
    "link": "https://cses.fi/problemset/task/1624",
    "source": "cses",
    "track": "dsa",
    "difficulty": "hard",
    "topic": "Backtracking",
    "patterns": [
      "Backtracking"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-intro"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-sum-of-two-values",
    "title": "Sum of Two Values",
    "link": "https://cses.fi/problemset/task/1640",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers",
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-maximum-subarray-sum",
    "title": "Maximum Subarray Sum",
    "link": "https://cses.fi/problemset/task/1643",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Kadane's Algorithm",
    "patterns": [
      "Kadane's Algorithm"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-apartments",
    "title": "Apartments",
    "link": "https://cses.fi/problemset/task/1084",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers",
      "Sorting"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-ferris-wheel",
    "title": "Ferris Wheel",
    "link": "https://cses.fi/problemset/task/1090",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-concert-tickets",
    "title": "Concert Tickets",
    "link": "https://cses.fi/problemset/task/1091",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Binary Search",
    "patterns": [
      "Binary Search"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-restaurant-customers",
    "title": "Restaurant Customers",
    "link": "https://cses.fi/problemset/task/1619",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Interval Scheduling / Merge Intervals",
    "patterns": [
      "Interval Scheduling / Merge Intervals"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-movie-festival",
    "title": "Movie Festival",
    "link": "https://cses.fi/problemset/task/1629",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Interval Scheduling / Merge Intervals",
    "patterns": [
      "Interval Scheduling / Merge Intervals",
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-sorting"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-building-roads",
    "title": "Building Roads",
    "link": "https://cses.fi/problemset/task/1666",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "Graph",
    "patterns": [
      "DFS",
      "Union-Find/DSU"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-graph"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-message-route",
    "title": "Message Route",
    "link": "https://cses.fi/problemset/task/1667",
    "source": "cses",
    "track": "dsa",
    "difficulty": "easy",
    "topic": "BFS",
    "patterns": [
      "BFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-graph"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-building-teams",
    "title": "Building Teams",
    "link": "https://cses.fi/problemset/task/1668",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "Bipartite Check",
    "patterns": [
      "BFS",
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-graph"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "cses-round-trip",
    "title": "Round Trip",
    "link": "https://cses.fi/problemset/task/1669",
    "source": "cses",
    "track": "dsa",
    "difficulty": "medium",
    "topic": "DFS",
    "patterns": [
      "DFS"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "cses-graph"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-solve-me-first",
    "title": "Solve Me First",
    "link": "https://www.hackerrank.com/challenges/solve-me-first/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-simple-array-sum",
    "title": "Simple Array Sum",
    "link": "https://www.hackerrank.com/challenges/simple-array-sum/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-compare-the-triplets",
    "title": "Compare the Triplets",
    "link": "https://www.hackerrank.com/challenges/compare-the-triplets/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-a-very-big-sum",
    "title": "A Very Big Sum",
    "link": "https://www.hackerrank.com/challenges/a-very-big-sum/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-diagonal-difference",
    "title": "Diagonal Difference",
    "link": "https://www.hackerrank.com/challenges/diagonal-difference/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Matrix Traversal",
    "patterns": [
      "Matrix Traversal"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-plus-minus",
    "title": "Plus Minus",
    "link": "https://www.hackerrank.com/challenges/plus-minus/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-staircase",
    "title": "Staircase",
    "link": "https://www.hackerrank.com/challenges/staircase/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-mini-max-sum",
    "title": "Mini-Max Sum",
    "link": "https://www.hackerrank.com/challenges/mini-max-sum/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-birthday-cake-candles",
    "title": "Birthday Cake Candles",
    "link": "https://www.hackerrank.com/challenges/birthday-cake-candles/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-time-conversion",
    "title": "Time Conversion",
    "link": "https://www.hackerrank.com/challenges/time-conversion/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-grading-students",
    "title": "Grading Students",
    "link": "https://www.hackerrank.com/challenges/grading/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-apple-and-orange",
    "title": "Apple and Orange",
    "link": "https://www.hackerrank.com/challenges/apple-and-orange/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-number-line-jumps",
    "title": "Number Line Jumps",
    "link": "https://www.hackerrank.com/challenges/number-line-jumps/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-between-two-sets",
    "title": "Between Two Sets",
    "link": "https://www.hackerrank.com/challenges/between-two-sets/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Number Theory (GCD/Sieve)",
    "patterns": [
      "Number Theory (GCD/Sieve)"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-breaking-the-records",
    "title": "Breaking the Records",
    "link": "https://www.hackerrank.com/challenges/breaking-best-and-worst-records/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-subarray-division",
    "title": "Subarray Division",
    "link": "https://www.hackerrank.com/challenges/the-birthday-bar/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Sliding Window",
    "patterns": [
      "Sliding Window"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-divisible-sum-pairs",
    "title": "Divisible Sum Pairs",
    "link": "https://www.hackerrank.com/challenges/divisible-sum-pairs/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-migratory-birds",
    "title": "Migratory Birds",
    "link": "https://www.hackerrank.com/challenges/migratory-birds/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-day-of-the-programmer",
    "title": "Day of the Programmer",
    "link": "https://www.hackerrank.com/challenges/day-of-the-programmer/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-bill-division",
    "title": "Bill Division",
    "link": "https://www.hackerrank.com/challenges/bon-appetit/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-sales-by-match",
    "title": "Sales by Match",
    "link": "https://www.hackerrank.com/challenges/sock-merchant/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-drawing-book",
    "title": "Drawing Book",
    "link": "https://www.hackerrank.com/challenges/drawing-book/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-counting-valleys",
    "title": "Counting Valleys",
    "link": "https://www.hackerrank.com/challenges/counting-valleys/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-cats-and-a-mouse",
    "title": "Cats and a Mouse",
    "link": "https://www.hackerrank.com/challenges/cats-and-a-mouse/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-picking-numbers",
    "title": "Picking Numbers",
    "link": "https://www.hackerrank.com/challenges/picking-numbers/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-the-hurdle-race",
    "title": "The Hurdle Race",
    "link": "https://www.hackerrank.com/challenges/the-hurdle-race/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-designer-pdf-viewer",
    "title": "Designer PDF Viewer",
    "link": "https://www.hackerrank.com/challenges/designer-pdf-viewer/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-utopian-tree",
    "title": "Utopian Tree",
    "link": "https://www.hackerrank.com/challenges/utopian-tree/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-angry-professor",
    "title": "Angry Professor",
    "link": "https://www.hackerrank.com/challenges/angry-professor/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-beautiful-days-at-the-movies",
    "title": "Beautiful Days at the Movies",
    "link": "https://www.hackerrank.com/challenges/beautiful-days-at-the-movies/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-viral-advertising",
    "title": "Viral Advertising",
    "link": "https://www.hackerrank.com/challenges/viral-advertising/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-save-the-prisoner-",
    "title": "Save the Prisoner!",
    "link": "https://www.hackerrank.com/challenges/save-the-prisoner/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-circular-array-rotation",
    "title": "Circular Array Rotation",
    "link": "https://www.hackerrank.com/challenges/circular-array-rotation/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-sequence-equation",
    "title": "Sequence Equation",
    "link": "https://www.hackerrank.com/challenges/sequence-equation/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-find-digits",
    "title": "Find Digits",
    "link": "https://www.hackerrank.com/challenges/find-digits/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-extra-long-factorials",
    "title": "Extra Long Factorials",
    "link": "https://www.hackerrank.com/challenges/extra-long-factorials/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "medium",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-append-and-delete",
    "title": "Append and Delete",
    "link": "https://www.hackerrank.com/challenges/append-and-delete/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-sherlock-and-squares",
    "title": "Sherlock and Squares",
    "link": "https://www.hackerrank.com/challenges/sherlock-and-squares/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-library-fine",
    "title": "Library Fine",
    "link": "https://www.hackerrank.com/challenges/library-fine/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Math",
    "patterns": [
      "Math"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-cut-the-sticks",
    "title": "Cut the sticks",
    "link": "https://www.hackerrank.com/challenges/cut-the-sticks/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Arrays",
    "patterns": [
      "Arrays"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-equalize-the-array",
    "title": "Equalize the Array",
    "link": "https://www.hackerrank.com/challenges/equalize-the-array/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-repeated-string",
    "title": "Repeated String",
    "link": "https://www.hackerrank.com/challenges/repeated-string/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-jumping-on-the-clouds",
    "title": "Jumping on the Clouds",
    "link": "https://www.hackerrank.com/challenges/jumping-on-the-clouds/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Greedy",
    "patterns": [
      "Greedy"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-camelcase",
    "title": "CamelCase",
    "link": "https://www.hackerrank.com/challenges/camelcase/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-strong-password",
    "title": "Strong Password",
    "link": "https://www.hackerrank.com/challenges/strong-password/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-caesar-cipher",
    "title": "Caesar Cipher",
    "link": "https://www.hackerrank.com/challenges/caesar-cipher-1/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-mars-exploration",
    "title": "Mars Exploration",
    "link": "https://www.hackerrank.com/challenges/mars-exploration/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-hackerrank-in-a-string-",
    "title": "HackerRank in a String!",
    "link": "https://www.hackerrank.com/challenges/hackerrank-in-a-string/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-pangrams",
    "title": "Pangrams",
    "link": "https://www.hackerrank.com/challenges/pangrams/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-funny-string",
    "title": "Funny String",
    "link": "https://www.hackerrank.com/challenges/funny-string/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-gemstones",
    "title": "Gemstones",
    "link": "https://www.hackerrank.com/challenges/gem-stones/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-alternating-characters",
    "title": "Alternating Characters",
    "link": "https://www.hackerrank.com/challenges/alternating-characters/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-beautiful-binary-string",
    "title": "Beautiful Binary String",
    "link": "https://www.hackerrank.com/challenges/beautiful-binary-string/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Strings",
    "patterns": [
      "Strings"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-the-love-letter-mystery",
    "title": "The Love-Letter Mystery",
    "link": "https://www.hackerrank.com/challenges/the-love-letter-mystery/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-palindrome-index",
    "title": "Palindrome Index",
    "link": "https://www.hackerrank.com/challenges/palindrome-index/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Two Pointers",
    "patterns": [
      "Two Pointers"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-anagram",
    "title": "Anagram",
    "link": "https://www.hackerrank.com/challenges/anagram/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-making-anagrams",
    "title": "Making Anagrams",
    "link": "https://www.hackerrank.com/challenges/making-anagrams/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-game-of-thrones-i",
    "title": "Game of Thrones - I",
    "link": "https://www.hackerrank.com/challenges/game-of-thrones/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-two-strings",
    "title": "Two Strings",
    "link": "https://www.hackerrank.com/challenges/two-strings/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  },
  {
    "id": "hackerrank-string-construction",
    "title": "String Construction",
    "link": "https://www.hackerrank.com/challenges/string-construction/problem",
    "source": "hackerrank",
    "track": "programming",
    "difficulty": "easy",
    "topic": "Hashing",
    "patterns": [
      "Hashing"
    ],
    "companies": [],
    "frequency": "medium",
    "sheetRefs": [
      "hackerrank-basic"
    ],
    "addedAt": "2026-07-22"
  }
];

const { dedupeProblems } = require('./dedupeDsa.util');

async function seedDsaData() {
  try {
    // 1. Seed Topics
    for (let index = 0; index < RAW_TOPICS.length; index++) {
      const topicName = RAW_TOPICS[index];
      const refs = REFERENCE_LINKS[topicName] || [];
      await DsaTopic.findOneAndUpdate(
        { name: topicName },
        { name: topicName, referenceLinks: refs, order: index },
        { upsert: true, new: true }
      );
    }

    // 2. Deduplicate problem bank
    const uniqueProblems = dedupeProblems(INITIAL_PROBLEMS);

    // 3. Seed Enriched Problems
    const bulkOps = uniqueProblems.map((p, index) => {
      const track = p.track || (
        p.source === 'hackerrank' || (p.difficulty === 'easy' && (p.source === 'gfg' || p.source === 'leetcode'))
          ? 'programming'
          : 'dsa'
      );

      const slugId = p.id || `${p.source || 'lc'}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      return {
        updateOne: {
          filter: { link: p.link.trim() },
          update: {
            $set: {
              slugId,
              title: p.title.trim(),
              link: p.link.trim(),
              source: (p.source || 'leetcode').toLowerCase().trim(),
              track,
              difficulty: (p.difficulty || 'easy').toLowerCase().trim(),
              topic: p.topic.trim(),
              patterns: Array.isArray(p.patterns) ? p.patterns : [p.topic.trim()],
              companies: Array.isArray(p.companies) ? p.companies : [],
              frequency: (p.frequency || 'medium').toLowerCase().trim(),
              sheetRefs: Array.isArray(p.sheetRefs) ? p.sheetRefs : ['curated-sheet'],
              order: index,
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      const result = await DsaProblem.bulkWrite(bulkOps);
      console.log(`[DSA SEED] Successfully seeded ${uniqueProblems.length} verified problems across DSA and Programming tracks. (Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount})`);
    }

  } catch (error) {
    console.error('[DSA SEED ERROR]', error.message);
  }
}

module.exports = { seedDsaData, RAW_TOPICS, REFERENCE_LINKS, INITIAL_PROBLEMS };
