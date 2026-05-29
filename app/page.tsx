"use client"

import { useEffect, useState } from "react"

export default function Home() {

  const [players, setPlayers] = useState<any[]>([])
  const [updatedAt, setUpdatedAt] = useState("")

  const [sortKey, setSortKey] = useState("SAP")
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {

    fetch("/npb_pitcher_stats_all.json")
      .then((res) => res.json())
      .then((data) => {

        setPlayers(data.players)
        setUpdatedAt(data.updated_at)

      })

  }, [])

  // ==========================================
  // 条件達成色
  // ==========================================
  const highlightClass = (condition: boolean) => {

    return condition
      ? "bg-yellow-300 text-black font-bold"
      : ""

  }

  // ==========================================
  // 球団カラー
  // ==========================================
  const teamColorClass = (team: string) => {

    const colors: Record<string, string> = {

      "阪神":
        "bg-yellow-400 text-black font-bold",

      "巨人":
        "bg-orange-500 text-white font-bold",

      "DeNA":
        "bg-blue-500 text-white font-bold",

      "広島":
        "bg-red-600 text-white font-bold",

      "ヤクルト":
        "bg-green-600 text-white font-bold",

      "中日":
        "bg-blue-700 text-white font-bold",

      "ソフトバンク":
        "bg-yellow-300 text-black font-bold",

      "日本ハム":
        "bg-cyan-500 text-black font-bold",

      "西武":
        "bg-indigo-700 text-white font-bold",

      "ロッテ":
        "bg-gray-900 text-white font-bold",

      "楽天":
        "bg-rose-800 text-white font-bold",

      "オリックス":
        "bg-slate-700 text-white font-bold"

    }

    return colors[team] || "bg-gray-700 text-white"

  }

  // ==========================================
  // 先頭0削除
  // ==========================================
  const removeZero = (value: string) => {

    if (value.startsWith("0.")) {
      return value.substring(1)
    }

    return value

  }

  // ==========================================
  // 防御率
  // ==========================================
  const formatERA = (value: number) => {

    return Number(value).toFixed(2)

  }

  // ==========================================
  // 勝率
  // ==========================================
  const formatWinPct = (value: number) => {

    return removeZero(Number(value).toFixed(3))

  }

  // ==========================================
  // 小数1位
  // ==========================================
  const formatOneDecimal = (value: number) => {

    return Number(value).toFixed(1)

  }

  // ==========================================
  // SAP表示
  // ==========================================
  const formatSAP = (
    value: number,
    allValues: number[]
  ) => {

    const rounded3 = value.toFixed(3)

    const sameRounded = allValues.filter(
      (v) => v.toFixed(3) === rounded3
    )

    const exactSame = sameRounded.filter(
      (v) => v === value
    )

    // 完全一致
    if (sameRounded.length === exactSame.length) {

      return removeZero(rounded3)

    }

    // 差が出るまで表示
    let digit = 4

    while (digit <= 10) {

      const current = value.toFixed(digit)

      const duplicated = sameRounded.some(
        (v) =>
          v !== value &&
          v.toFixed(digit) === current
      )

      if (!duplicated) {

        return removeZero(current)

      }

      digit++

    }

    return removeZero(value.toFixed(10))

  }

  // ==========================================
  // SAP増減表示
  // ==========================================
  const formatSAPDiff = (value: number) => {

    const absValue = Math.abs(value).toFixed(3)

    if (value > 0) {
      return `↑${removeZero(absValue)}`
    }

    if (value < 0) {
      return `↓${removeZero(absValue)}`
    }

    return "-.000"

  }

  // ==========================================
  // SAP一覧
  // ==========================================
  const sapValues = players.map(
    (p) => Number(p["SAP"])
  )

  // ==========================================
  // ソート
  // ==========================================
  const sortedPlayers = [...players].sort((a, b) => {

    const aValue = a[sortKey]
    const bValue = b[sortKey]

    if (
      typeof aValue === "number" &&
      typeof bValue === "number"
    ) {

      return sortAsc
        ? aValue - bValue
        : bValue - aValue

    }

    return sortAsc
      ? String(aValue).localeCompare(String(bValue), "ja")
      : String(bValue).localeCompare(String(aValue), "ja")

  })

  // ==========================================
  // TOP3はSAP固定
  // ==========================================
  const top3Players = [...players]
    .sort(
      (a, b) =>
        Number(b["SAP"]) - Number(a["SAP"])
    )
    .slice(0, 3)

    // ==========================================
    // ソートマーク
    // ==========================================
    const renderSortIcon = (key: string) => {
    
      const isActive = sortKey === key
    
      return (
    
        <span className="inline-flex flex-col ml-1 leading-none">
    
          <span
            className={
              isActive && sortAsc
                ? "text-white"
                : "text-gray-500"
            }
          >
            ▲
          </span>
    
          <span
            className={
              isActive && !sortAsc
                ? "text-blue-300"
                : "text-gray-500"
            }
          >
            ▼
          </span>
    
        </span>
    
      )
    
    }

  // ==========================================
  // ヘッダークリック
  // ==========================================
  const handleSort = (key: string) => {

    if (sortKey === key) {

      setSortAsc(!sortAsc)

    } else {

      setSortKey(key)

      if (key.includes("防御率")) {

        setSortAsc(true)

      } else {

        setSortAsc(false)

      }
    }
  }

  return (

    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-gray-100 p-3 md:p-6">

      {/* タイトル */}
      <div className="mb-6 md:mb-8">

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          2026年沢村賞レース
        </h1>

        <p className="text-blue-300 text-sm md:text-lg">
          Sawamura Award Point
        </p>

        <p className="text-gray-400 mt-2 text-sm">
          最終更新: {updatedAt?.split(" ")[0]}
        </p>

      </div>

      {/* TOP3カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">

        {top3Players.map((player, index) => {

          const medals = ["🥇", "🥈", "🥉"]

          return (

            <div
              key={player["選手名"]}
              className="
                rounded-2xl
                bg-gray-900/80
                border border-gray-700
                p-4 md:p-6
                shadow-xl
                backdrop-blur
              "
            >

              <div className="text-3xl mb-3">
                {medals[index]}
              </div>

              <div className="text-xl md:text-2xl font-bold text-white">
                {player["選手名"]}
              </div>

              <div className="text-blue-300 mt-1">
                {player["球団"]}
              </div>

              <div className="mt-4">

                <div className="text-sm text-gray-400">
                  SAP
                </div>

                <div className="text-3xl md:text-5xl font-extrabold text-yellow-300">
                  {formatSAP(
                    Number(player["SAP"]),
                    sapValues
                  )}
                </div>

                <div
                  className={`
                    mt-2
                    text-sm
                    font-bold
                    ${
                      Number(player["SAP増減"]) > 0
                        ? "text-green-400"
                        : Number(player["SAP増減"]) < 0
                        ? "text-red-400"
                        : "text-gray-400"
                    }
                  `}
                >

                  {
                    formatSAPDiff(
                      Number(player["SAP増減"])
                    )
                  }

                </div>

              </div>

              <div className="mt-4 text-gray-300">
                基準達成数:
                <span className="ml-2 font-bold text-green-400">
                  {player["基準達成数"]}/7
                </span>
              </div>

            </div>

          )
        })}

      </div>

      {/* テーブル */}
      <p className="text-xs md:text-sm text-gray-400 mb-2">
        ※規定投球回到達者のみ
      </p>
      
      <div className="overflow-x-auto">

        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-2xl">

          <table className="min-w-full border-collapse text-[11px] md:text-sm whitespace-nowrap">

            <thead className="sticky top-0 bg-gray-900 z-20">

              <tr className="bg-gray-800">

                <th className="border border-gray-700 p-1.5 md:p-2 sticky left-0 bg-gray-800 z-30" rowSpan={2}>
                  選手名
                </th>

                <th className="border border-gray-700 p-1.5 md:p-2" rowSpan={2}>
                  球団
                </th>

                <th className="border border-gray-700 p-1.5 md:p-2" colSpan={7}>
                  現在の成績
                </th>

                <th className="border border-gray-700 p-1.5 md:p-2" colSpan={11}>
                  143試合換算
                </th>

              </tr>

              <tr className="bg-gray-700">

                {[
                  "防御率",
                  "登板",
                  "完投",
                  "勝利",
                  "勝率",
                  "投球回",
                  "奪三振",
                  "143試合換算防御率",
                  "143試合換算登板",
                  "143試合換算完投",
                  "143試合換算勝利",
                  "143試合換算勝率",
                  "143試合換算投球回",
                  "143試合換算奪三振",
                  "基準達成数",
                  "沢村賞受賞回数",
                  "SAP増減",
                  "SAP"
                ].map((key) => (

                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="
                      border
                      border-gray-600
                      p-1.5 md:p-2
                      cursor-pointer
                      hover:bg-blue-900
                      transition
                    "
                  >
                    <div className="flex items-center justify-center gap-1">

                      <span>
                        {key.replace("143試合換算", "")}
                      </span>
                    
                      {renderSortIcon(key)}
                    
                    </div>
                    
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {sortedPlayers.map((player, index) => (

                <tr
                  key={index}
                  className="hover:bg-gray-800"
                >

                  <td className="border border-gray-700 p-1.5 md:p-2 font-bold sticky left-0 bg-gray-950 z-10">
                    {player["選手名"]}
                  </td>

                  <td
                    className={`
                      border
                      border-gray-700
                      p-1.5 md:p-2
                      text-center
                      ${teamColorClass(player["球団"])}
                    `}
                  >
                    {player["球団"]}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {formatERA(player["防御率"])}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {player["登板"]}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {player["完投"]}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {player["勝利"]}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {formatWinPct(player["勝率"])}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {formatOneDecimal(player["投球回"])}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2">
                    {player["奪三振"]}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算防御率"] <= 2.5)}`}>
                    {formatERA(player["143試合換算防御率"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算登板"] >= 25)}`}>
                    {formatOneDecimal(player["143試合換算登板"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算完投"] >= 8)}`}>
                    {formatOneDecimal(player["143試合換算完投"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算勝利"] >= 15)}`}>
                    {formatOneDecimal(player["143試合換算勝利"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算勝率"] >= 0.6)}`}>
                    {formatWinPct(player["143試合換算勝率"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算投球回"] >= 180)}`}>
                    {formatOneDecimal(player["143試合換算投球回"])}
                  </td>

                  <td className={`border border-gray-700 p-1.5 md:p-2 ${highlightClass(player["143試合換算奪三振"] >= 150)}`}>
                    {formatOneDecimal(player["143試合換算奪三振"])}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2 text-center font-bold">
                    {player["基準達成数"]}
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2 text-center">
                    {player["沢村賞受賞回数"]}
                  </td>

                  <td
                    className={`
                      border border-gray-700
                      p-1.5 md:p-2
                      text-center
                      font-bold
                      ${
                        Number(player["SAP増減"]) > 0
                          ? "text-green-400"
                          : Number(player["SAP増減"]) < 0
                          ? "text-red-400"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {
                      formatSAPDiff(
                        Number(player["SAP増減"])
                      )
                    }
                  </td>

                  <td className="border border-gray-700 p-1.5 md:p-2 text-center font-bold text-yellow-300">
                    {
                      formatSAP(
                        Number(player["SAP"]),
                        sapValues
                      )
                    }
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
      
      {/* SAPとは */}
        <section
          className="
            mt-10
            rounded-2xl
            bg-gray-900/70
            border border-gray-700
            p-6
            md:p-8
            shadow-xl
          "
        >
        
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            SAPとは
          </h2>
        
          <div className="space-y-4 text-sm md:text-base text-gray-300 leading-8">
        
            <p>
              <span className="font-bold text-yellow-300">
                SAP（Sawamura Award Point）
              </span>
              は、そのシーズンの沢村賞受賞可能性を表す指標です。
              過去の沢村賞受賞投手の成績をもとに、
              AIの分析手法の一つである
              「ロジスティック回帰」を用いて算出しています。
            </p>
        
            <p>
              2005〜2025年の沢村賞選考を学習データとし、
              各投手の成績から
              「沢村賞を受賞する確率」
              を推定しています。
            </p>
        
            <p>
              分析には主に以下の項目を使用しています。
            </p>
        
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
        
              <li>防御率</li>
              <li>勝利数</li>
              <li>沢村賞選考基準7項目の達成数</li>
              <li>過去の沢村賞受賞回数</li>
        
            </ul>
        
            <p>
              SAPは
              <span className="font-bold text-yellow-300 mx-1">
                0〜1
              </span>
              の値を取り、
              1に近いほど沢村賞受賞の可能性が高いことを表します。
            </p>
        
            <p>
              過去データで検証すると、
              2005〜2025年のうち、
              各年のSAP1位と沢村賞受賞者が一致しなかったのは
              2020年と2025年のみで、
              比較的高い精度を示しています。
              ただし、完璧な指標ではないため、
              あくまで沢村賞レースを楽しむための参考指標のひとつとしてご覧ください。
            </p>
        
          </div>
        
        </section>

    </main>

  )
}