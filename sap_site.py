import requests
import pandas as pd
from io import StringIO
from bs4 import BeautifulSoup
import time
import math


# ==========================================
# セ・リーグ / パ・リーグ URL
# ==========================================
URLS = {
    "セリーグ": "https://baseball.yahoo.co.jp/npb/stats/pitcher?gameKindId=1&type=era",
    "パリーグ": "https://baseball.yahoo.co.jp/npb/stats/pitcher?gameKindId=2&type=era"
}


# ==========================================
# 共通headers
# ==========================================
headers = {
    "User-Agent": "Mozilla/5.0"
}


# ==========================================
# チーム試合数取得
# ==========================================
standings_url = "https://baseball.yahoo.co.jp/npb/standings/"

response = requests.get(
    standings_url,
    headers=headers
)

response.encoding = "utf-8"

standings_html = StringIO(response.text)

standings_tables = pd.read_html(standings_html)

central_df = standings_tables[0]
pacific_df = standings_tables[1]


# ==========================================
# 球団試合数テーブル作成
# ==========================================
central_games = central_df[["チーム名", "試合"]]
pacific_games = pacific_df[["チーム名", "試合"]]

games_df = pd.concat(
    [central_games, pacific_games],
    ignore_index=True
)

games_df.columns = ["球団", "試合数"]


# ==========================================
# 全リーグDataFrame格納用
# ==========================================
all_dfs = []


# ==========================================
# 各リーグ取得
# ==========================================
for league_name, url in URLS.items():

    print(f"\n===== {league_name}取得中 =====")

    response = requests.get(
        url,
        headers=headers
    )

    response.encoding = "utf-8"

    html = response.text

    # ==========================================
    # フルネーム取得
    # ==========================================
    soup = BeautifulSoup(html, "html.parser")
    
    full_name_map = {}
    
    player_links = soup.select('a[href*="/npb/player/"]')
    
    for link in player_links:
    
        href = link.get("href")
    
        short_name = link.get_text(strip=True)
    
        if not href or not short_name:
            continue
    
        # 選手ページURL
        player_url = "https://baseball.yahoo.co.jp" + href
    
        try:
    
            player_response = requests.get(
                player_url,
                headers=headers
            )
    
            player_response.encoding = "utf-8"
    
            player_soup = BeautifulSoup(
                player_response.text,
                "html.parser"
            )
    
            # title取得
            title = player_soup.title.string
    
            # 例:
            # 髙橋宏斗 - 中日ドラゴンズ
            full_name = title.split(" - ")[0].strip()
    
            full_name_map[short_name] = full_name
    
            # アクセス負荷軽減
            time.sleep(0.3)
    
        except Exception as e:
    
            print("取得失敗:", short_name, e)

    # ==========================================
    # 表取得
    # ==========================================
    df = pd.read_html(StringIO(html))[0]

    # ==========================================
    # 列名整理
    # ==========================================
    df.columns = [
        "順位",
        "選手名",
        "防御率",
        "登板",
        "先発",
        "完投",
        "完封",
        "QS",
        "勝利",
        "敗戦",
        "ホールド",
        "HP",
        "セーブ",
        "勝率",
        "投球回",
        "被安打",
        "被本塁打",
        "奪三振",
        "奪三振率",
        "与四球",
        "与死球",
        "暴投",
        "ボーク",
        "失点",
        "自責点",
        "被打率",
        "KBB",
        "QS率",
        "WHIP"
    ]

    # ==========================================
    # 必要列のみ
    # ==========================================
    df = df[
        [
            "選手名",
            "防御率",
            "登板",
            "完投",
            "勝利",
            "勝率",
            "投球回",
            "奪三振"
        ]
    ]

    # ==========================================
    # 不要行削除
    # ==========================================
    df = df[df["選手名"] != "選手名"]

    # ==========================================
    # 選手名と球団分離
    # ==========================================
    df["球団"] = df["選手名"].str.extract(r"\((.*?)\)")

    df["選手名"] = (
        df["選手名"]
        .str.replace(r"\s*\(.*?\)", "", regex=True)
        .str.strip()
    )

    # ==========================================
    # フルネームへ変換
    # ==========================================
    def convert_full_name(name):
    
        for short_name, full_name in full_name_map.items():
    
            if name == short_name:
                return full_name
    
        return name
    
    
    df["選手名"] = df["選手名"].apply(convert_full_name)

    # ==========================================
    # 球団名変換
    # ==========================================
    team_name_map = {
        "神": "阪神",
        "広": "広島",
        "中": "中日",
        "デ": "DeNA",
        "ヤ": "ヤクルト",
        "巨": "巨人",
        "西": "西武",
        "オ": "オリックス",
        "ソ": "ソフトバンク",
        "日": "日本ハム",
        "楽": "楽天",
        "ロ": "ロッテ"
    }

    df["球団"] = df["球団"].map(team_name_map)

    # ==========================================
    # 数値変換
    # ==========================================
    numeric_cols = [
        "防御率",
        "登板",
        "完投",
        "勝利",
        "勝率",
        "投球回",
        "奪三振"
    ]

    df[numeric_cols] = df[numeric_cols].apply(
        pd.to_numeric,
        errors="coerce"
    )

    # ==========================================
    # 球団試合数を結合
    # ==========================================
    df = df.merge(
        games_df,
        on="球団",
        how="left"
    )

    # ==========================================
    # 143試合換算
    # ==========================================
    df["143試合換算防御率"] = df["防御率"]

    df["143試合換算登板"] = (
        df["登板"] / df["試合数"] * 143
    ).round(1)

    df["143試合換算完投"] = (
        df["完投"] / df["試合数"] * 143
    ).round(1)

    df["143試合換算勝利"] = (
        df["勝利"] / df["試合数"] * 143
    ).round(1)

    df["143試合換算勝率"] = df["勝率"]

    df["143試合換算投球回"] = (
        df["投球回"] / df["試合数"] * 143
    ).round(1)

    df["143試合換算奪三振"] = (
        df["奪三振"] / df["試合数"] * 143
    ).round(1)

    # ==========================================
    # 基準達成数
    # ==========================================
    conditions = [
        df["143試合換算防御率"] <= 2.5,
        df["143試合換算登板"] >= 25,
        df["143試合換算完投"] >= 8,
        df["143試合換算勝利"] >= 15,
        df["143試合換算勝率"] >= 0.6,
        df["143試合換算投球回"] >= 180,
        df["143試合換算奪三振"] >= 150
    ]

    df["基準達成数"] = sum(conditions)
    
    # ==========================================
    # 沢村賞受賞回数
    # ==========================================
    sawamura_count_map = {
        "伊藤 大海": 1,
        "大野 雄大": 1,
        "前田 健太": 2,
        "田中 将大": 2,
        "涌井 秀章": 1
    }
    
    df["沢村賞受賞回数"] = (
        df["選手名"]
        .map(sawamura_count_map)
        .fillna(0)
        .astype(int)
    )

    all_dfs.append(df)
    
    # ==========================================
    # SAP計算
    # ==========================================
    A = (
        -1.2853942 * df["防御率"]
        + 0.31344637 * df["143試合換算勝利"]
        + 0.8549082 * df["基準達成数"]
        - 0.28303695 * df["沢村賞受賞回数"]
        - 7.46890775
    )
    
    df["SAP"] = (
        1 / (1 + (-A).apply(math.exp))
    ).round(3)


# ==========================================
# セ・パ統合
# ==========================================
all_df = pd.concat(
    all_dfs,
    ignore_index=True
)

# ==========================================
# SAP順ソート
# ==========================================
all_df = all_df.sort_values(
    "SAP",
    ascending=False
).reset_index(drop=True)

# ==========================================
# 更新日時取得
# ==========================================
from datetime import datetime

updated_at = datetime.now().strftime(
    "%Y-%m-%d %H:%M:%S"
)

import os

# ==========================================
# 前回SAP読み込み
# ==========================================
previous_sap_map = {}

json_path = "public/npb_pitcher_stats_all.json"

if os.path.exists(json_path):

    try:

        previous_df = pd.read_json(json_path)

        if "players" in previous_df.columns:

            previous_players = previous_df["players"][0]

            for player in previous_players:

                previous_sap_map[
                    player["選手名"]
                ] = player["SAP"]

    except Exception as e:

        print("前回JSON読み込み失敗:", e)

# ==========================================
# SAP増減
# ==========================================
sap_diff_list = []

for _, row in all_df.iterrows():

    current_sap = row["SAP"]

    previous_sap = previous_sap_map.get(
        row["選手名"],
        current_sap
    )

    diff = current_sap - previous_sap

    sap_diff_list.append(round(diff, 6))

all_df["SAP増減"] = sap_diff_list


# ==========================================
# JSON保存
# ==========================================
json_data = {
    "updated_at": updated_at,
    "players": all_df.to_dict(orient="records")
}

import json

with open(
    "public/npb_pitcher_stats_all.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        json_data,
        f,
        ensure_ascii=False,
        indent=2
    )

print("\nJSON保存完了")