const DsaTopic   = require('../models/DsaTopic.model');
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
    title: "Two Sum – Return indices adding to target",
    link: "https://leetcode.com/problems/two-sum/",
    source: "leetcode",
    difficulty: "easy",
    topic: "Hashing",
  },
  {
    title: "Maximum Subarray (Kadane’s Algorithm)",
    link: "https://leetcode.com/problems/maximum-subarray/",
    source: "leetcode",
    difficulty: "easy",
    topic: "Kadane's Algorithm"
  },
  {
    title: "Largest Sum Contiguous Subarray",
    link: "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/",
    source: "gfg",
    difficulty: "medium",
    topic: "Kadane's Algorithm"
  },
  {
    title: "Maximum Sum Subarray of Size K",
    link: "https://www.geeksforgeeks.org/find-maximum-minimum-sum-subarray-size-k/",
    source: "gfg",
    difficulty: "medium",
    topic: "Kadane's Algorithm"
  },
  {
    title: "Maximum Product Subarray",
    link: "https://leetcode.com/problems/maximum-product-subarray/",
    source: "leetcode",
    difficulty: "medium",
    topic: "Kadane's Algorithm"
  },
  {
    title: "Circular Subarray Sum",
    link: "https://leetcode.com/problems/maximum-sum-circular-subarray/",
    source: "leetcode",
    difficulty: "hard",
    topic: "Kadane's Algorithm"
  }
];

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

    // 2. Seed Initial Problems if not already present
    for (let index = 0; index < INITIAL_PROBLEMS.length; index++) {
      const p = INITIAL_PROBLEMS[index];
      await DsaProblem.findOneAndUpdate(
        { title: p.title, topic: p.topic },
        { ...p, order: index },
        { upsert: true, new: true }
      );
    }

    console.log('[DSA SEED] Successfully seeded 41 DSA topics with reference links and initial problems.');
  } catch (error) {
    console.error('[DSA SEED ERROR]', error.message);
  }
}

module.exports = { seedDsaData, RAW_TOPICS, REFERENCE_LINKS, INITIAL_PROBLEMS };
