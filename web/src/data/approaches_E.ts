import type { Approach } from '../types'
import { b } from '../anim/helpers'

export const approachesE: Record<string, Approach[]> = {
  '510C': [
    {
      name: b('Try all alphabet permutations', '枚举所有字母表排列'),
      complexity: 'O(26!·total)',
      detail: b(
        'Enumerate every possible ordering of the 26 letters and check whether the name list is sorted under it. Correct but astronomically large.',
        '枚举 26 个字母的每一种排列，逐一检验该顺序下名字列表是否有序。正确，但规模天文数字级。'),
    },
    {
      name: b('Constraint edges + topological sort', '约束建边 + 拓扑排序'),
      complexity: 'O(total + 26²)',
      optimal: true,
      detail: b(
        'Compare each adjacent pair of names: at their first differing character u, v add an edge u→v meaning u must come before v. Topologically sort the 26 letters; a cycle or a longer name being a prefix of an earlier shorter one ⇒ Impossible.',
        '比较相邻两个名字：在第一个不同的字符 u、v 处加一条边 u→v，表示 u 必须排在 v 前面。对 26 个字母做拓扑排序；若出现环，或较长名字是前面较短名字的前缀，则 Impossible。'),
    },
  ],
  '427C': [
    {
      name: b('Pairwise mutual-reachability', '两两互达判定'),
      complexity: 'O(n·(n+m))',
      detail: b(
        'From each node run BFS/DFS both forward and backward to find which junctions are mutually reachable, grouping them. Correct but quadratic.',
        '从每个点分别正向、反向 BFS/DFS，找出彼此互相可达的路口并分组。正确但平方级。'),
    },
    {
      name: b('Tarjan/Kosaraju SCC', 'Tarjan/Kosaraju 强连通分量'),
      complexity: 'O(n+m)',
      optimal: true,
      detail: b(
        'Condense the graph into strongly connected components: each SCC needs exactly one checkpost, placed at its cheapest node. Sum those minima for the total cost and multiply the counts of cheapest nodes for the number of ways.',
        '把图缩成强连通分量：每个 SCC 恰需一个检查站，建在分量内代价最小的点上。把各分量的最小代价相加得总花费，把各分量中最小代价点的个数相乘得方案数。'),
    },
  ],
  '20C': [
    {
      name: b('Bellman–Ford', 'Bellman–Ford'),
      complexity: 'O(n·m)',
      detail: b(
        'Relax all edges n−1 times to compute shortest distances from node 1. Works on these weights but is slow.',
        '对所有边松弛 n−1 轮，求出从 1 号点的最短距离。在此权值下可行，但偏慢。'),
    },
    {
      name: b('Dijkstra with a heap + predecessor array', '堆优化 Dijkstra + 前驱数组'),
      complexity: 'O(m log n)',
      optimal: true,
      detail: b(
        'Settle the nearest unfinished node first using a priority queue, recording prev[] on each relaxation to reconstruct the path by walking back from n. Weights rule out plain BFS, while non-negative weights make Dijkstra valid.',
        '用优先队列每次先确定最近的未完成点，松弛时记录 prev[]，最后从 n 回溯还原路径。带权使普通 BFS 失效，而非负权又保证了 Dijkstra 的正确性。'),
    },
  ],
  '1245D': [
    {
      name: b('Brute subsets of stations', '暴力枚举建站子集'),
      complexity: 'O(2^n)',
      detail: b(
        'Try every subset of cities that get their own power station, connecting the rest. Exponential — only feasible for tiny n.',
        '枚举哪些城市自建发电站的所有子集，其余城市用连线供电。指数级，只有 n 极小才可行。'),
    },
    {
      name: b('Virtual-source MST (Prim)', '虚拟源点最小生成树（Prim）'),
      complexity: 'O(n²)',
      optimal: true,
      detail: b(
        'Add a virtual source whose edge to city i has weight c_i (the station cost); building a station becomes "connect to the source," so the whole problem turns into one MST. The graph is dense, so O(n²) Prim is the right choice.',
        '加一个虚拟源点，它到城市 i 的边权为 c_i（建站成本）；这样“建站”就等价于“连到源点”，整个问题化为一棵最小生成树。图是稠密的，故选 O(n²) 的 Prim。'),
    },
    {
      name: b('Virtual-source MST (Kruskal + DSU)', '虚拟源点最小生成树（Kruskal + 并查集）'),
      complexity: 'O(m log m)',
      detail: b(
        'The same virtual-source model, solved by sorting all edges and uniting components with a disjoint-set union. Equivalent result; better suited to sparser edge sets.',
        '同样的虚拟源点模型，改用对所有边排序、并查集合并的 Kruskal 求解。结果等价，更适合边较稀疏的情形。'),
    },
  ],
  '999E': [
    {
      name: b('Greedy repair by BFS', 'BFS 贪心补边'),
      complexity: 'O(n·m)',
      detail: b(
        'Repeatedly BFS from the capital and, whenever some city is unreachable, add an edge to it and rerun. Correct but slow due to repeated traversals.',
        '反复从首都 BFS，每当发现有城市不可达，就向它加一条边并重跑。正确，但因反复遍历而偏慢。'),
    },
    {
      name: b('SCC condensation', '强连通分量缩点'),
      complexity: 'O(n+m)',
      optimal: true,
      detail: b(
        'Condense the graph into a DAG of strongly connected components. The answer is the number of components with zero indegree, excluding the one containing the capital — each must receive a fresh edge.',
        '把图缩成由强连通分量构成的 DAG。答案即入度为 0 的分量个数（不计首都所在的那个）——每个这样的分量都必须新加一条入边。'),
    },
  ],
  '118E': [
    {
      name: b('Try orientations / per-edge connectivity', '枚举定向 / 逐边判连通'),
      complexity: 'O(2^m) or O(m·(n+m))',
      detail: b(
        'Either brute-force every orientation of the edges, or test each edge by checking connectivity when it is removed. Both are far too slow.',
        '要么暴力枚举每条边的方向，要么逐边检验删去它后的连通性。两者都太慢。'),
    },
    {
      name: b('DFS bridge detection', 'DFS 桥检测'),
      complexity: 'O(n+m)',
      optimal: true,
      detail: b(
        'Run a DFS to find bridges: if any bridge exists the graph cannot be made strongly connected (Robbins\' theorem) ⇒ Impossible. Otherwise orient every tree edge downward and every back edge upward.',
        '用一次 DFS 找桥：若存在桥，则无法定向成强连通（Robbins 定理）⇒ Impossible。否则把所有树边朝下定向、所有返祖边朝上定向即可。'),
    },
  ],
  '1000E': [
    {
      name: b('Brute over all (s,t)', '暴力枚举所有 (s,t)'),
      complexity: 'O(n²·(n+m))',
      detail: b(
        'For every pair of endpoints (s, t), count the bridges that every s→t path is forced to cross. Correct but far too slow.',
        '对每一对端点 (s, t)，统计所有 s→t 路径都被迫经过的桥数。正确但太慢。'),
    },
    {
      name: b('Bridge tree + diameter', '桥树 + 直径'),
      complexity: 'O(n+m)',
      optimal: true,
      detail: b(
        'Contract each 2-edge-connected component into a single node, forming a tree whose edges are exactly the bridges. The maximum number of forced bridges equals the tree\'s diameter, found with two BFS passes.',
        '把每个边双连通分量缩成一个点，得到一棵以桥为边的“桥树”。被迫经过的桥数最大值就等于这棵树的直径，用两次 BFS 即可求得。'),
    },
  ],
}
