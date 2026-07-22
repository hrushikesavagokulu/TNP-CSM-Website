const fs   = require('fs');
const path = require('path');
const { dedupeProblems } = require('../utils/dedupeDsa.util');

// Load current initial problems from seedDsa.util.js
const seedFilePath = path.join(__dirname, '../utils/seedDsa.util.js');
const seedContent  = fs.readFileSync(seedFilePath, 'utf8');

// Additional curated problems batch 1: LeetCode NeetCode 150 & Striver SDE Sheet
const LEETCODE_EXPANSION = [
  // Two Pointers & Sliding Window
  { title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Two Sum II - Input Array Is Sorted", link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["neetcode-150"] },
  { title: "4Sum", link: "https://leetcode.com/problems/4sum/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["striver-sde"] },
  { title: "Longest Substring Without Repeating Characters", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Sliding Window", patterns: ["Sliding Window"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Permutation in String", link: "https://leetcode.com/problems/permutation-in-string/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Sliding Window", patterns: ["Sliding Window"], sheetRefs: ["neetcode-150"] },
  { title: "Sliding Window Maximum", link: "https://leetcode.com/problems/sliding-window-maximum/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Sliding Window Maximum", patterns: ["Sliding Window Maximum", "Monotonic Queue"], sheetRefs: ["neetcode-150", "striver-sde"] },
  
  // Binary Search
  { title: "Search a 2D Matrix II", link: "https://leetcode.com/problems/search-a-2d-matrix-ii/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Search", patterns: ["Binary Search"], sheetRefs: ["striver-sde"] },
  { title: "Koko Eating Bananas", link: "https://leetcode.com/problems/koko-eating-bananas/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Search on Answer", patterns: ["Binary Search on Answer"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Capacity To Ship Packages Within D Days", link: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Search on Answer", patterns: ["Binary Search on Answer"], sheetRefs: ["striver-sde"] },
  { title: "Split Array Largest Sum", link: "https://leetcode.com/problems/split-array-largest-sum/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Binary Search on Answer", patterns: ["Binary Search on Answer"], sheetRefs: ["striver-sde"] },
  { title: "Find Peak Element", link: "https://leetcode.com/problems/find-peak-element/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Search", patterns: ["Binary Search"], sheetRefs: ["striver-sde"] },
  { title: "Single Element in a Sorted Array", link: "https://leetcode.com/problems/single-element-in-a-sorted-array/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Search", patterns: ["Binary Search"], sheetRefs: ["striver-sde"] },

  // Stack & Queue
  { title: "Asteroid Collision", link: "https://leetcode.com/problems/asteroid-collision/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Stack", patterns: ["Stack"], sheetRefs: ["neetcode-150"] },
  { title: "Car Fleet", link: "https://leetcode.com/problems/car-fleet/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Monotonic Stack", patterns: ["Monotonic Stack"], sheetRefs: ["neetcode-150"] },
  { title: "Online Stock Span", link: "https://leetcode.com/problems/online-stock-span/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Monotonic Stack", patterns: ["Monotonic Stack"], sheetRefs: ["striver-sde"] },
  { title: "Sum of Subarray Minimums", link: "https://leetcode.com/problems/sum-of-subarray-minimums/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Monotonic Stack", patterns: ["Monotonic Stack"], sheetRefs: ["striver-sde"] },
  { title: "Maximal Rectangle", link: "https://leetcode.com/problems/maximal-rectangle/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Monotonic Stack", patterns: ["Monotonic Stack"], sheetRefs: ["striver-sde"] },

  // Linked List
  { title: "Reverse Nodes in k-Group", link: "https://leetcode.com/problems/reverse-nodes-in-k-group/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Linked List", patterns: ["Linked List"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "LRU Cache", link: "https://leetcode.com/problems/lru-cache/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Doubly Linked List", patterns: ["Doubly Linked List", "Hashing"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "LFU Cache", link: "https://leetcode.com/problems/lfu-cache/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Doubly Linked List", patterns: ["Doubly Linked List", "Hashing"], sheetRefs: ["striver-sde"] },
  { title: "Flatten a Multilevel Doubly Linked List", link: "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Doubly Linked List", patterns: ["Doubly Linked List"], sheetRefs: ["striver-sde"] },

  // Trees & BST
  { title: "Invert Binary Tree", link: "https://leetcode.com/problems/invert-binary-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Maximum Depth of Binary Tree", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Diameter of Binary Tree", link: "https://leetcode.com/problems/diameter-of-binary-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Balanced Binary Tree", link: "https://leetcode.com/problems/balanced-binary-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Same Tree", link: "https://leetcode.com/problems/same-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Subtree of Another Tree", link: "https://leetcode.com/problems/subtree-of-another-tree/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Lowest Common Ancestor of a Binary Search Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "BST", patterns: ["BST"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Lowest Common Ancestor of a Binary Tree", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["striver-sde"] },
  { title: "Binary Tree Level Order Traversal", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Tree", patterns: ["BFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Binary Tree Right Side View", link: "https://leetcode.com/problems/binary-tree-right-side-view/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Tree", patterns: ["BFS"], sheetRefs: ["neetcode-150"] },
  { title: "Count Good Nodes in Binary Tree", link: "https://leetcode.com/problems/count-good-nodes-in-binary-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150"] },
  { title: "Validate Binary Search Tree", link: "https://leetcode.com/problems/validate-binary-search-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "BST", patterns: ["BST"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Kth Smallest Element in a BST", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "BST", patterns: ["BST"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Construct Binary Tree from Preorder and Inorder Traversal", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Binary Tree Maximum Path Sum", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Binary Tree", patterns: ["DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Serialize and Deserialize Binary Tree", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Binary Tree", patterns: ["BFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Implement Trie (Prefix Tree)", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Trie", patterns: ["Trie"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Design Add and Search Words Data Structure", link: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Trie", patterns: ["Trie"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Word Search II", link: "https://leetcode.com/problems/word-search-ii/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Trie", patterns: ["Trie", "Backtracking"], sheetRefs: ["neetcode-150", "blind-75"] },

  // Heap & Top-K / K-way Merge
  { title: "Kth Largest Element in a Stream", link: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Heap", patterns: ["Heap/Priority Queue"], sheetRefs: ["neetcode-150"] },
  { title: "Last Stone Weight", link: "https://leetcode.com/problems/last-stone-weight/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Heap", patterns: ["Heap/Priority Queue"], sheetRefs: ["neetcode-150"] },
  { title: "K Closest Points to Origin", link: "https://leetcode.com/problems/k-closest-points-to-origin/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Top-K / K-way Merge", patterns: ["Top-K / K-way Merge", "Heap/Priority Queue"], sheetRefs: ["neetcode-150"] },
  { title: "Task Scheduler", link: "https://leetcode.com/problems/task-scheduler/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Heap", patterns: ["Heap/Priority Queue", "Greedy"], sheetRefs: ["neetcode-150"] },
  { title: "Design Twitter", link: "https://leetcode.com/problems/design-twitter/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Top-K / K-way Merge", patterns: ["Top-K / K-way Merge", "Heap/Priority Queue"], sheetRefs: ["neetcode-150"] },
  { title: "Find Median from Data Stream", link: "https://leetcode.com/problems/find-median-from-data-stream/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Heap", patterns: ["Heap/Priority Queue"], sheetRefs: ["neetcode-150", "blind-75"] },

  // Graphs & Union-Find
  { title: "Clone Graph", link: "https://leetcode.com/problems/clone-graph/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Graph", patterns: ["DFS", "BFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Max Area of Island", link: "https://leetcode.com/problems/max-area-of-island/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DFS", patterns: ["DFS"], sheetRefs: ["neetcode-150"] },
  { title: "Walls and Gates", link: "https://leetcode.com/problems/walls-and-gates/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "BFS", patterns: ["BFS"], sheetRefs: ["neetcode-150"] },
  { title: "Rotting Oranges", link: "https://leetcode.com/problems/rotting-oranges/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "BFS", patterns: ["BFS"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Redundant Connection", link: "https://leetcode.com/problems/redundant-connection/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Union-Find/DSU", patterns: ["Union-Find/DSU"], sheetRefs: ["neetcode-150"] },
  { title: "Number of Connected Components in an Undirected Graph", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Union-Find/DSU", patterns: ["Union-Find/DSU"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Graph Valid Tree", link: "https://leetcode.com/problems/graph-valid-tree/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Union-Find/DSU", patterns: ["Union-Find/DSU", "DFS"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Word Ladder", link: "https://leetcode.com/problems/word-ladder/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "BFS", patterns: ["BFS"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Network Delay Time", link: "https://leetcode.com/problems/network-delay-time/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Dijkstra", patterns: ["Dijkstra"], sheetRefs: ["neetcode-150"] },
  { title: "Cheapest Flights Within K Stops", link: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Bellman-Ford", patterns: ["Bellman-Ford", "BFS"], sheetRefs: ["neetcode-150"] },
  { title: "Min Cost to Connect All Points", link: "https://leetcode.com/problems/min-cost-to-connect-all-points/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "MST (Kruskal/Prim)", patterns: ["MST (Kruskal/Prim)"], sheetRefs: ["neetcode-150"] },
  { title: "Swim in Rising Water", link: "https://leetcode.com/problems/swim-in-rising-water/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "Dijkstra", patterns: ["Dijkstra", "Binary Search on Answer"], sheetRefs: ["neetcode-150"] },

  // DP (1D, 2D, Subsequences, Knapsack)
  { title: "Min Cost Climbing Stairs", link: "https://leetcode.com/problems/min-cost-climbing-stairs/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "DP (1D)", patterns: ["DP (1D)"], sheetRefs: ["neetcode-150"] },
  { title: "House Robber", link: "https://leetcode.com/problems/house-robber/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "House Robber II", link: "https://leetcode.com/problems/house-robber-ii/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Longest Palindromic Substring", link: "https://leetcode.com/problems/longest-palindromic-substring/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)", "Two Pointers"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Palindromic Substrings", link: "https://leetcode.com/problems/palindromic-substrings/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)", "Two Pointers"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Coin Change", link: "https://leetcode.com/problems/coin-change/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Knapsack", patterns: ["Knapsack", "DP (1D)"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Maximum Product Subarray", link: "https://leetcode.com/problems/maximum-product-subarray/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Word Break", link: "https://leetcode.com/problems/word-break/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)", "Trie"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Longest Increasing Subsequence", link: "https://leetcode.com/problems/longest-increasing-subsequence/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP on Subsequences", patterns: ["DP on Subsequences", "Binary Search"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Partition Equal Subset Sum", link: "https://leetcode.com/problems/partition-equal-subset-sum/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Knapsack", patterns: ["Knapsack"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Unique Paths", link: "https://leetcode.com/problems/unique-paths/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (2D/Grid)", patterns: ["DP (2D/Grid)"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Longest Common Subsequence", link: "https://leetcode.com/problems/longest-common-subsequence/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP on Subsequences", patterns: ["DP on Subsequences"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Best Time to Buy and Sell Stock with Cooldown", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (1D)", patterns: ["DP (1D)"], sheetRefs: ["neetcode-150"] },
  { title: "Coin Change II", link: "https://leetcode.com/problems/coin-change-ii/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Knapsack", patterns: ["Knapsack"], sheetRefs: ["neetcode-150"] },
  { title: "Target Sum", link: "https://leetcode.com/problems/target-sum/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Knapsack", patterns: ["Knapsack"], sheetRefs: ["neetcode-150"] },
  { title: "Interleaving String", link: "https://leetcode.com/problems/interleaving-string/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (2D/Grid)", patterns: ["DP (2D/Grid)"], sheetRefs: ["neetcode-150"] },
  { title: "Edit Distance", link: "https://leetcode.com/problems/edit-distance/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "DP (2D/Grid)", patterns: ["DP (2D/Grid)"], sheetRefs: ["neetcode-150", "striver-sde"] },
  { title: "Longest Increasing Path in a Matrix", link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "DP (2D/Grid)", patterns: ["DP (2D/Grid)", "DFS"], sheetRefs: ["neetcode-150"] },
  { title: "Distinct Subsequences", link: "https://leetcode.com/problems/distinct-subsequences/", source: "leetcode", track: "dsa", difficulty: "hard", topic: "DP on Subsequences", patterns: ["DP on Subsequences"], sheetRefs: ["neetcode-150"] },

  // Greedy & Intervals
  { title: "Maximum Subarray", link: "https://leetcode.com/problems/maximum-subarray/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Kadane's Algorithm", patterns: ["Kadane's Algorithm"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Jump Game", link: "https://leetcode.com/problems/jump-game/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Jump Game II", link: "https://leetcode.com/problems/jump-game-ii/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["neetcode-150"] },
  { title: "Gas Station", link: "https://leetcode.com/problems/gas-station/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["neetcode-150"] },
  { title: "Hand of Straights", link: "https://leetcode.com/problems/hand-of-straights/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["neetcode-150"] },
  { title: "N-meetings in one room", link: "https://www.geeksforgeeks.org/n-meetings-in-one-room/", source: "gfg", track: "dsa", difficulty: "easy", topic: "Interval Scheduling / Merge Intervals", patterns: ["Interval Scheduling / Merge Intervals", "Greedy"], sheetRefs: ["striver-sde"] },
  { title: "Minimum Platforms", link: "https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/", source: "gfg", track: "dsa", difficulty: "medium", topic: "Interval Scheduling / Merge Intervals", patterns: ["Interval Scheduling / Merge Intervals", "Greedy"], sheetRefs: ["striver-sde"] },
  { title: "Job Sequencing Problem", link: "https://www.geeksforgeeks.org/job-sequencing-problem/", source: "gfg", track: "dsa", difficulty: "medium", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["striver-sde"] },
  { title: "Non-overlapping Intervals", link: "https://leetcode.com/problems/non-overlapping-intervals/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Interval Scheduling / Merge Intervals", patterns: ["Interval Scheduling / Merge Intervals", "Greedy"], sheetRefs: ["neetcode-150", "blind-75"] },

  // Bit Manipulation & Number Theory
  { title: "Single Number", link: "https://leetcode.com/problems/single-number/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Number of 1 Bits", link: "https://leetcode.com/problems/number-of-1-bits/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Counting Bits", link: "https://leetcode.com/problems/counting-bits/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation", "DP (1D)"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Reverse Bits", link: "https://leetcode.com/problems/reverse-bits/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Missing Number", link: "https://leetcode.com/problems/missing-number/", source: "leetcode", track: "dsa", difficulty: "easy", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Sum of Two Integers", link: "https://leetcode.com/problems/sum-of-two-integers/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["neetcode-150", "blind-75"] },
  { title: "Reverse Integer", link: "https://leetcode.com/problems/reverse-integer/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Math", patterns: ["Math"], sheetRefs: ["neetcode-150"] },
  { title: "Pow(x, n)", link: "https://leetcode.com/problems/powx-n/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Number Theory (GCD/Sieve)", patterns: ["Number Theory (GCD/Sieve)"], sheetRefs: ["striver-sde"] },

  // Math & Matrix
  { title: "Rotate Image", link: "https://leetcode.com/problems/rotate-image/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Matrix Traversal", patterns: ["Matrix Traversal"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Spiral Matrix", link: "https://leetcode.com/problems/spiral-matrix/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Matrix Traversal", patterns: ["Matrix Traversal"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
  { title: "Set Matrix Zeroes", link: "https://leetcode.com/problems/set-matrix-zeroes/", source: "leetcode", track: "dsa", difficulty: "medium", topic: "Matrix Traversal", patterns: ["Matrix Traversal"], sheetRefs: ["neetcode-150", "blind-75", "striver-sde"] },
];

// Codeforces Division 2 & High Frequency Classic Set
const CODEFORCES_EXPANSION = [
  { title: "Watermelon", link: "https://codeforces.com/problemset/problem/4/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Way Too Long Words", link: "https://codeforces.com/problemset/problem/71/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Team", link: "https://codeforces.com/problemset/problem/231/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Next Round", link: "https://codeforces.com/problemset/problem/158/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["codeforces-classic"] },
  { title: "Domino piling", link: "https://codeforces.com/problemset/problem/50/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Bit++", link: "https://codeforces.com/problemset/problem/282/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Petya and Strings", link: "https://codeforces.com/problemset/problem/112/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Helpful Maths", link: "https://codeforces.com/problemset/problem/339/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Sorting", patterns: ["Sorting"], sheetRefs: ["codeforces-classic"] },
  { title: "Word Capitalization", link: "https://codeforces.com/problemset/problem/281/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Boy or Girl", link: "https://codeforces.com/problemset/problem/236/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["codeforces-classic"] },
  { title: "Stones on the Table", link: "https://codeforces.com/problemset/problem/266/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Elephant", link: "https://codeforces.com/problemset/problem/617/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math", "Greedy"], sheetRefs: ["codeforces-classic"] },
  { title: "Soldier and Bananas", link: "https://codeforces.com/problemset/problem/546/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Bear and Big Brother", link: "https://codeforces.com/problemset/problem/791/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Wrong Subtraction", link: "https://codeforces.com/problemset/problem/977/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Nearly Lucky Number", link: "https://codeforces.com/problemset/problem/110/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Anton and Danik", link: "https://codeforces.com/problemset/problem/734/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Translation", link: "https://codeforces.com/problemset/problem/41/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Vanya and Fence", link: "https://codeforces.com/problemset/problem/677/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Beautiful Year", link: "https://codeforces.com/problemset/problem/271/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "In Search of an Easy Problem", link: "https://codeforces.com/problemset/problem/1030/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["codeforces-classic"] },
  { title: "George and Accommodation", link: "https://codeforces.com/problemset/problem/467/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Presents", link: "https://codeforces.com/problemset/problem/136/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["codeforces-classic"] },
  { title: "Magnets", link: "https://codeforces.com/problemset/problem/344/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["codeforces-classic"] },
  { title: "Calculating Function", link: "https://codeforces.com/problemset/problem/486/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Drinks", link: "https://codeforces.com/problemset/problem/200/B", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Is your horseshoe on the other hoof?", link: "https://codeforces.com/problemset/problem/228/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["codeforces-classic"] },
  { title: "I Wanna Be the Guy", link: "https://codeforces.com/problemset/problem/469/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["codeforces-classic"] },
  { title: "Divisibility Problem", link: "https://codeforces.com/problemset/problem/1328/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Fox And Snake", link: "https://codeforces.com/problemset/problem/510/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Matrix Traversal", patterns: ["Matrix Traversal"], sheetRefs: ["codeforces-classic"] },
  { title: "Hit the Lottery", link: "https://codeforces.com/problemset/problem/996/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["codeforces-classic"] },
  { title: "Pangram", link: "https://codeforces.com/problemset/problem/520/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["codeforces-classic"] },
  { title: "Hulk", link: "https://codeforces.com/problemset/problem/705/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Chat room", link: "https://codeforces.com/problemset/problem/58/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["codeforces-classic"] },
  { title: "Young Physicist", link: "https://codeforces.com/problemset/problem/69/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Lucky Division", link: "https://codeforces.com/problemset/problem/122/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "HQ9+", link: "https://codeforces.com/problemset/problem/133/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
  { title: "Twins", link: "https://codeforces.com/problemset/problem/160/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Greedy", patterns: ["Greedy", "Sorting"], sheetRefs: ["codeforces-classic"] },
  { title: "Even Odds", link: "https://codeforces.com/problemset/problem/318/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Expression", link: "https://codeforces.com/problemset/problem/479/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["codeforces-classic"] },
  { title: "Kefa and First Steps", link: "https://codeforces.com/problemset/problem/580/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Kadane's Algorithm", patterns: ["DP (1D)"], sheetRefs: ["codeforces-classic"] },
  { title: "cAPS lOCK", link: "https://codeforces.com/problemset/problem/131/A", source: "codeforces", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["codeforces-classic"] },
];

// CSES Problem Set (Official Stable Tasks)
const CSES_EXPANSION = [
  { title: "Weird Algorithm", link: "https://cses.fi/problemset/task/1068", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Missing Number", link: "https://cses.fi/problemset/task/1083", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Repetitions", link: "https://cses.fi/problemset/task/1069", source: "cses", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Two Pointers"], sheetRefs: ["cses-intro"] },
  { title: "Increasing Array", link: "https://cses.fi/problemset/task/1094", source: "cses", track: "dsa", difficulty: "easy", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["cses-intro"] },
  { title: "Permutations", link: "https://cses.fi/problemset/task/1070", source: "cses", track: "dsa", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["cses-intro"] },
  { title: "Number Spiral", link: "https://cses.fi/problemset/task/1071", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Two Knights", link: "https://cses.fi/problemset/task/1072", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Two Sets", link: "https://cses.fi/problemset/task/1092", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math", "Greedy"], sheetRefs: ["cses-intro"] },
  { title: "Bit Strings", link: "https://cses.fi/problemset/task/1617", source: "cses", track: "dsa", difficulty: "easy", topic: "Number Theory (GCD/Sieve)", patterns: ["Number Theory (GCD/Sieve)"], sheetRefs: ["cses-intro"] },
  { title: "Trailing Zeros", link: "https://cses.fi/problemset/task/1618", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Coin Piles", link: "https://cses.fi/problemset/task/1754", source: "cses", track: "dsa", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["cses-intro"] },
  { title: "Palindrome Reorder", link: "https://cses.fi/problemset/task/1755", source: "cses", track: "dsa", difficulty: "easy", topic: "Strings", patterns: ["Hashing"], sheetRefs: ["cses-intro"] },
  { title: "Gray Code", link: "https://cses.fi/problemset/task/2205", source: "cses", track: "dsa", difficulty: "medium", topic: "Bit Manipulation", patterns: ["Bit Manipulation"], sheetRefs: ["cses-intro"] },
  { title: "Tower of Hanoi", link: "https://cses.fi/problemset/task/2165", source: "cses", track: "dsa", difficulty: "medium", topic: "Recursion", patterns: ["Recursion"], sheetRefs: ["cses-intro"] },
  { title: "Creating Strings", link: "https://cses.fi/problemset/task/1622", source: "cses", track: "dsa", difficulty: "medium", topic: "Backtracking", patterns: ["Backtracking"], sheetRefs: ["cses-intro"] },
  { title: "Apple Division", link: "https://cses.fi/problemset/task/1623", source: "cses", track: "dsa", difficulty: "medium", topic: "Recursion", patterns: ["Bitmask DP"], sheetRefs: ["cses-intro"] },
  { title: "Chessboard and Queens", link: "https://cses.fi/problemset/task/1624", source: "cses", track: "dsa", difficulty: "hard", topic: "Backtracking", patterns: ["Backtracking"], sheetRefs: ["cses-intro"] },
  { title: "Sum of Two Values", link: "https://cses.fi/problemset/task/1640", source: "cses", track: "dsa", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers", "Hashing"], sheetRefs: ["cses-sorting"] },
  { title: "Maximum Subarray Sum", link: "https://cses.fi/problemset/task/1643", source: "cses", track: "dsa", difficulty: "easy", topic: "Kadane's Algorithm", patterns: ["Kadane's Algorithm"], sheetRefs: ["cses-sorting"] },
  { title: "Apartments", link: "https://cses.fi/problemset/task/1084", source: "cses", track: "dsa", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers", "Sorting"], sheetRefs: ["cses-sorting"] },
  { title: "Ferris Wheel", link: "https://cses.fi/problemset/task/1090", source: "cses", track: "dsa", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers", "Greedy"], sheetRefs: ["cses-sorting"] },
  { title: "Concert Tickets", link: "https://cses.fi/problemset/task/1091", source: "cses", track: "dsa", difficulty: "medium", topic: "Binary Search", patterns: ["Binary Search"], sheetRefs: ["cses-sorting"] },
  { title: "Restaurant Customers", link: "https://cses.fi/problemset/task/1619", source: "cses", track: "dsa", difficulty: "medium", topic: "Interval Scheduling / Merge Intervals", patterns: ["Interval Scheduling / Merge Intervals"], sheetRefs: ["cses-sorting"] },
  { title: "Movie Festival", link: "https://cses.fi/problemset/task/1629", source: "cses", track: "dsa", difficulty: "easy", topic: "Interval Scheduling / Merge Intervals", patterns: ["Interval Scheduling / Merge Intervals", "Greedy"], sheetRefs: ["cses-sorting"] },
  { title: "Building Roads", link: "https://cses.fi/problemset/task/1666", source: "cses", track: "dsa", difficulty: "easy", topic: "Graph", patterns: ["DFS", "Union-Find/DSU"], sheetRefs: ["cses-graph"] },
  { title: "Message Route", link: "https://cses.fi/problemset/task/1667", source: "cses", track: "dsa", difficulty: "easy", topic: "BFS", patterns: ["BFS"], sheetRefs: ["cses-graph"] },
  { title: "Building Teams", link: "https://cses.fi/problemset/task/1668", source: "cses", track: "dsa", difficulty: "medium", topic: "Bipartite Check", patterns: ["BFS", "DFS"], sheetRefs: ["cses-graph"] },
  { title: "Round Trip", link: "https://cses.fi/problemset/task/1669", source: "cses", track: "dsa", difficulty: "medium", topic: "DFS", patterns: ["DFS"], sheetRefs: ["cses-graph"] },
];

// HackerRank Problem Solving Basic + Interview Prep (Programming Track)
const HACKERRANK_EXPANSION = [
  { title: "Solve Me First", link: "https://www.hackerrank.com/challenges/solve-me-first/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Simple Array Sum", link: "https://www.hackerrank.com/challenges/simple-array-sum/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Compare the Triplets", link: "https://www.hackerrank.com/challenges/compare-the-triplets/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "A Very Big Sum", link: "https://www.hackerrank.com/challenges/a-very-big-sum/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Diagonal Difference", link: "https://www.hackerrank.com/challenges/diagonal-difference/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Matrix Traversal", patterns: ["Matrix Traversal"], sheetRefs: ["hackerrank-basic"] },
  { title: "Plus Minus", link: "https://www.hackerrank.com/challenges/plus-minus/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Staircase", link: "https://www.hackerrank.com/challenges/staircase/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Mini-Max Sum", link: "https://www.hackerrank.com/challenges/mini-max-sum/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Birthday Cake Candles", link: "https://www.hackerrank.com/challenges/birthday-cake-candles/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Time Conversion", link: "https://www.hackerrank.com/challenges/time-conversion/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Grading Students", link: "https://www.hackerrank.com/challenges/grading/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Apple and Orange", link: "https://www.hackerrank.com/challenges/apple-and-orange/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Number Line Jumps", link: "https://www.hackerrank.com/challenges/number-line-jumps/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Between Two Sets", link: "https://www.hackerrank.com/challenges/between-two-sets/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Number Theory (GCD/Sieve)", patterns: ["Number Theory (GCD/Sieve)"], sheetRefs: ["hackerrank-basic"] },
  { title: "Breaking the Records", link: "https://www.hackerrank.com/challenges/breaking-best-and-worst-records/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Subarray Division", link: "https://www.hackerrank.com/challenges/the-birthday-bar/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Sliding Window", patterns: ["Sliding Window"], sheetRefs: ["hackerrank-basic"] },
  { title: "Divisible Sum Pairs", link: "https://www.hackerrank.com/challenges/divisible-sum-pairs/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Migratory Birds", link: "https://www.hackerrank.com/challenges/migratory-birds/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Day of the Programmer", link: "https://www.hackerrank.com/challenges/day-of-the-programmer/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Bill Division", link: "https://www.hackerrank.com/challenges/bon-appetit/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Sales by Match", link: "https://www.hackerrank.com/challenges/sock-merchant/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Drawing Book", link: "https://www.hackerrank.com/challenges/drawing-book/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Counting Valleys", link: "https://www.hackerrank.com/challenges/counting-valleys/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Cats and a Mouse", link: "https://www.hackerrank.com/challenges/cats-and-a-mouse/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Picking Numbers", link: "https://www.hackerrank.com/challenges/picking-numbers/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "The Hurdle Race", link: "https://www.hackerrank.com/challenges/the-hurdle-race/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Designer PDF Viewer", link: "https://www.hackerrank.com/challenges/designer-pdf-viewer/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Utopian Tree", link: "https://www.hackerrank.com/challenges/utopian-tree/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Angry Professor", link: "https://www.hackerrank.com/challenges/angry-professor/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Beautiful Days at the Movies", link: "https://www.hackerrank.com/challenges/beautiful-days-at-the-movies/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Viral Advertising", link: "https://www.hackerrank.com/challenges/viral-advertising/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Save the Prisoner!", link: "https://www.hackerrank.com/challenges/save-the-prisoner/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Circular Array Rotation", link: "https://www.hackerrank.com/challenges/circular-array-rotation/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Sequence Equation", link: "https://www.hackerrank.com/challenges/sequence-equation/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Find Digits", link: "https://www.hackerrank.com/challenges/find-digits/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Extra Long Factorials", link: "https://www.hackerrank.com/challenges/extra-long-factorials/problem", source: "hackerrank", track: "programming", difficulty: "medium", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Append and Delete", link: "https://www.hackerrank.com/challenges/append-and-delete/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Sherlock and Squares", link: "https://www.hackerrank.com/challenges/sherlock-and-squares/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Library Fine", link: "https://www.hackerrank.com/challenges/library-fine/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Math", patterns: ["Math"], sheetRefs: ["hackerrank-basic"] },
  { title: "Cut the sticks", link: "https://www.hackerrank.com/challenges/cut-the-sticks/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Arrays", patterns: ["Arrays"], sheetRefs: ["hackerrank-basic"] },
  { title: "Equalize the Array", link: "https://www.hackerrank.com/challenges/equalize-the-array/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Repeated String", link: "https://www.hackerrank.com/challenges/repeated-string/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Jumping on the Clouds", link: "https://www.hackerrank.com/challenges/jumping-on-the-clouds/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Greedy", patterns: ["Greedy"], sheetRefs: ["hackerrank-basic"] },
  { title: "CamelCase", link: "https://www.hackerrank.com/challenges/camelcase/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Strong Password", link: "https://www.hackerrank.com/challenges/strong-password/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Caesar Cipher", link: "https://www.hackerrank.com/challenges/caesar-cipher-1/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Mars Exploration", link: "https://www.hackerrank.com/challenges/mars-exploration/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "HackerRank in a String!", link: "https://www.hackerrank.com/challenges/hackerrank-in-a-string/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Two Pointers"], sheetRefs: ["hackerrank-basic"] },
  { title: "Pangrams", link: "https://www.hackerrank.com/challenges/pangrams/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Funny String", link: "https://www.hackerrank.com/challenges/funny-string/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Gemstones", link: "https://www.hackerrank.com/challenges/gem-stones/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Alternating Characters", link: "https://www.hackerrank.com/challenges/alternating-characters/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "Beautiful Binary String", link: "https://www.hackerrank.com/challenges/beautiful-binary-string/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Strings", patterns: ["Strings"], sheetRefs: ["hackerrank-basic"] },
  { title: "The Love-Letter Mystery", link: "https://www.hackerrank.com/challenges/the-love-letter-mystery/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["hackerrank-basic"] },
  { title: "Palindrome Index", link: "https://www.hackerrank.com/challenges/palindrome-index/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Two Pointers", patterns: ["Two Pointers"], sheetRefs: ["hackerrank-basic"] },
  { title: "Anagram", link: "https://www.hackerrank.com/challenges/anagram/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Making Anagrams", link: "https://www.hackerrank.com/challenges/making-anagrams/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Game of Thrones - I", link: "https://www.hackerrank.com/challenges/game-of-thrones/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "Two Strings", link: "https://www.hackerrank.com/challenges/two-strings/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
  { title: "String Construction", link: "https://www.hackerrank.com/challenges/string-construction/problem", source: "hackerrank", track: "programming", difficulty: "easy", topic: "Hashing", patterns: ["Hashing"], sheetRefs: ["hackerrank-basic"] },
];

console.log('[EXPANSION SCRIPT] Processing bank expansion...');

// Read initial problems from seed file
const currentProblemsMatch = seedContent.match(/const INITIAL_PROBLEMS = (\[[\s\S]*?\]);\s*const \{ dedupeProblems \}/);

let existingProblems = [];
if (currentProblemsMatch) {
  try {
    existingProblems = eval(currentProblemsMatch[1]);
  } catch (err) {
    console.error('Failed to parse current INITIAL_PROBLEMS:', err.message);
  }
}

const allRaw = [
  ...existingProblems,
  ...LEETCODE_EXPANSION,
  ...CODEFORCES_EXPANSION,
  ...CSES_EXPANSION,
  ...HACKERRANK_EXPANSION,
];

console.log(`Raw Total before dedup: ${allRaw.length}`);
const deduped = dedupeProblems(allRaw);
console.log(`Verified Unique Total after dedup: ${deduped.length}`);

// Reformat seedDsa.util.js
const formattedProblemsJson = JSON.stringify(deduped, null, 2);

const updatedSeedContent = seedContent.replace(
  /const INITIAL_PROBLEMS = \[[\s\S]*?\];\s*const \{ dedupeProblems \}/,
  `const INITIAL_PROBLEMS = ${formattedProblemsJson};\n\nconst { dedupeProblems }`
);

fs.writeFileSync(seedFilePath, updatedSeedContent, 'utf8');
console.log(`[EXPANSION SCRIPT] Successfully updated ${seedFilePath} with ${deduped.length} verified problems.`);
