"""
Rungs Puzzle Generator
======================
Grid layout (4 rows x 2 cols):
  [0][1]   → row 0: should be [1,2]
  [2][3]   → row 1: should be [3,4]
  [4][5]   → row 2: should be [5,6]
  [6][7]   → row 3: should be [7,8]

Adjacent swaps allowed:
  Row swaps:    (0,1), (2,3), (4,5), (6,7)
  Column swaps: (0,2), (2,4), (4,6), (1,3), (3,5), (5,7)
"""

import sqlite3
from itertools import permutations
from collections import deque
from datetime import date, timedelta
import time

# --- Constants ---
GOAL = (1, 2, 3, 4, 5, 6, 7, 8)

ADJACENT_PAIRS = [
    # Row swaps
    (0, 1), (2, 3), (4, 5), (6, 7),
    # Column swaps
    (0, 2), (2, 4), (4, 6),
    (1, 3), (3, 5), (5, 7),
]

MIN_SWAPS = 6  # Minimum difficulty threshold

# --- BFS to find minimum swaps ---
def bfs_min_swaps(start: tuple) -> int:
    """Returns the minimum number of swaps to reach GOAL from start."""
    if start == GOAL:
        return 0
    visited = {start}
    queue = deque([(start, 0)])
    while queue:
        state, depth = queue.popleft()
        for i, j in ADJACENT_PAIRS:
            lst = list(state)
            lst[i], lst[j] = lst[j], lst[i]
            neighbor = tuple(lst)
            if neighbor == GOAL:
                return depth + 1
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, depth + 1))
    return -1  # Should never happen given full connectivity

# --- Generate all valid puzzles ---
def generate_puzzles() -> list[dict]:
    """Generate all permutations, compute min swaps, filter < MIN_SWAPS."""
    print("Generating all permutations and computing minimum swaps...")
    print("  (This may take 30 seconds to 3 minutes)")
    puzzles = []
    total = 0
    skipped = 0
    milestone = 5000
    start_time = time.time()

    for perm in permutations(range(1, 9)):
        if perm == GOAL:
            continue
        total += 1
        min_swaps = bfs_min_swaps(perm)
        if min_swaps >= MIN_SWAPS:
            puzzles.append({"board": list(perm), "min_swaps": min_swaps})
        else:
            skipped += 1

        if total % milestone == 0:
            elapsed = time.time() - start_time
            pct = total / 40319 * 100
            rate = total / elapsed if elapsed > 0 else 0
            eta = (40319 - total) / rate if rate > 0 else 0
            print(f"  [{pct:5.1f}%] {total:>6} / 40319 permutations — "
                  f"{len(puzzles)} valid so far — "
                  f"elapsed: {elapsed:.1f}s — ETA: {eta:.1f}s")

    elapsed = time.time() - start_time
    print(f"\n  Completed in {elapsed:.1f}s")
    print(f"  Total permutations checked : {total}")
    print(f"  Filtered (< {MIN_SWAPS} swaps): {skipped}")
    print(f"  Valid puzzles              : {len(puzzles)}")
    return puzzles

# Day of week: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
# Difficulty order: Mon is easiest (rank 0), Sun is hardest (rank 6)
DAY_DIFFICULTY_RANK = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}

def assign_dates(puzzles: list[dict]) -> list[dict]:
    """
    Sort all valid puzzles by min_swaps, split into 7 equal buckets,
    assign bucket 0 (easiest) to Monday, bucket 6 (hardest) to Sunday.
    Then interleave dates so the week always progresses easy -> hard.
    """
    # Sort puzzles by difficulty
    sorted_puzzles = sorted(puzzles, key=lambda x: x["min_swaps"])
    n = len(sorted_puzzles)
    bucket_size = n // 7
    remainder = n % 7  # leftover puzzles — distribute to harder days

    # Build 7 equal (or near-equal) buckets
    buckets = []
    idx = 0
    for b in range(7):
        # Harder buckets absorb the remainder puzzles one each
        extra = 1 if b >= (7 - remainder) else 0
        size = bucket_size + extra
        buckets.append(sorted_puzzles[idx: idx + size])
        idx += size

    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    print(f"\nEqual-split buckets (sorted by difficulty):")
    print(f"  {'Day':<6} {'Count':>6} {'Min Swaps':>10} {'Max Swaps':>10}")
    for day in range(7):
        b = buckets[day]
        print(f"  {days[day]:<6} {len(b):>6} {b[0]['min_swaps']:>10} {b[-1]['min_swaps']:>10}")

    # Assign dates: start from today, each weekday pulls from its bucket
    # in order, so difficulty always escalates Mon->Sun each week
    today = date.today()
    assigned = []
    day_counters = {i: 0 for i in range(7)}
    current_date = today
    total_assigned = 0

    while True:
        weekday = current_date.weekday()  # 0=Mon ... 6=Sun
        bucket = buckets[DAY_DIFFICULTY_RANK[weekday]]
        idx = day_counters[weekday]
        if idx >= len(bucket):
            break  # All puzzles for this weekday exhausted
        puzzle = bucket[idx].copy()
        puzzle["date"] = current_date.isoformat()
        puzzle["weekday"] = weekday
        assigned.append(puzzle)
        day_counters[weekday] += 1
        current_date += timedelta(days=1)
        total_assigned += 1

    print(f"\n  Total puzzles assigned with dates: {total_assigned}")
    weeks = total_assigned // 7
    print(f"  Approx coverage: {weeks} weeks ({weeks / 52:.1f} years)")
    return assigned

# --- Database ---
def init_db(conn: sqlite3.Connection):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS puzzles (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            date        TEXT    UNIQUE NOT NULL,
            weekday     INTEGER NOT NULL,
            min_swaps   INTEGER NOT NULL,
            cell_0      INTEGER NOT NULL,
            cell_1      INTEGER NOT NULL,
            cell_2      INTEGER NOT NULL,
            cell_3      INTEGER NOT NULL,
            cell_4      INTEGER NOT NULL,
            cell_5      INTEGER NOT NULL,
            cell_6      INTEGER NOT NULL,
            cell_7      INTEGER NOT NULL
        )
    """)
    conn.commit()

def insert_puzzles(conn: sqlite3.Connection, puzzles: list[dict]):
    rows = [
        (
            p["date"],
            p["weekday"],
            p["min_swaps"],
            *p["board"]
        )
        for p in puzzles
    ]
    conn.executemany("""
        INSERT OR IGNORE INTO puzzles
        (date, weekday, min_swaps, cell_0, cell_1, cell_2, cell_3,
         cell_4, cell_5, cell_6, cell_7)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    print(f"  Inserted {len(rows)} puzzles into database.")

# --- Main ---
def main():
    db_path = "rungs.db"

    # 1. Generate puzzles
    puzzles = generate_puzzles()

    # 2. Assign dates by difficulty
    puzzles_with_dates = assign_dates(puzzles)

    # 3. Store in SQLite
    print(f"\nWriting to {db_path}...")
    conn = sqlite3.connect(db_path)
    init_db(conn)
    insert_puzzles(conn, puzzles_with_dates)

    # 4. Quick sanity check
    cursor = conn.execute("""
        SELECT weekday, COUNT(*), MIN(min_swaps), MAX(min_swaps), AVG(min_swaps)
        FROM puzzles
        GROUP BY weekday
        ORDER BY weekday
    """)
    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    print("\nDatabase summary by weekday:")
    print(f"  {'Day':<6} {'Count':>6} {'MinSwaps':>9} {'MaxSwaps':>9} {'AvgSwaps':>9}")
    for row in cursor.fetchall():
        wd, cnt, mn, mx, avg = row
        print(f"  {days[wd]:<6} {cnt:>6} {mn:>9} {mx:>9} {avg:>9.1f}")

    conn.close()
    print("\nDone! rungs.db is ready.")

    # --- Write JSON output ---
    import json
    json_path = "rungs.json"
    json_output = [
        {
            "date": p["date"],
            "min_swaps": p["min_swaps"],
            "board": p["board"]
        }
        for p in puzzles_with_dates
    ]
    with open(json_path, "w") as f:
        json.dump(json_output, f, indent=2)
    print(f"Done! rungs.json is ready. ({len(json_output)} puzzles)")

if __name__ == "__main__":
    main()