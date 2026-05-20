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
      ? "bg-yellow-200 dark:bg-yellow-700 font-bold"
      : ""
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
    return value.toFixed(2)
  }

  // ==========================================
  // 勝率
  // ==========================================
  const formatWinPct = (value: number) => {
    return removeZero(value.toFixed(3))
  }

  // ==========================================
  // 小数1位
  // ==========================================
  const formatOneDecimal = (value: number) => {
    return value.toFixed(1)
  }

  // ==========================================
  // SAP表示
  // ==========================================
  const formatSAP = (
    value: number,
    allValues: number[]
  ) => {

    const rounded3 = value.toFixed(3)

    // 同じ小数第3位の値を探す
    const sameRounded = allValues.filter(
      (v) => v.toFixed(3) === rounded3
    )

    // 完全一致のみ
    const exactSame = sameRounded.filter(
      (v) => v === value
    )

    // 条件1
    if (sameRounded.length === exactSame.length) {
      return removeZero(rounded3)
    }

    // 条件2
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

  const sapValues = players.map(
    (p) => Number(p["SAP"])
  )
  
  // ==========================================
  // ソート
  // ==========================================
  const sortedPlayers = [...players].sort((a, b) => {

    const aValue = a[sortKey]
    const bValue = b[sortKey]

    // 数値
    if (
      typeof aValue === "number" &&
      typeof bValue === "number"
    ) {

      return sortAsc
        ? aValue - bValue
        : bValue - aValue
    }

    // 文字列
    return sortAsc
      ? String(aValue).localeCompare(String(bValue), "ja")
      : String(bValue).localeCompare(String(aValue), "ja")
  })


  // ==========================================
  // ヘッダークリック
  // ==========================================
  const handleSort = (key: string) => {
  
    if (sortKey === key) {
  
      setSortAsc(!sortAsc)

    } else {

      setSortKey(key)

      // 防御率だけ昇順
      if (
        key.includes("防御率")
      ) {
        setSortAsc(true)
      } else {
        setSortAsc(false)
      }
    }
  }

  return (

    <main className="p-8 bg-white dark:bg-gray-900 min-h-screen text-black dark:text-gray-100">

      <h1 className="text-3xl font-bold mb-6">
        2026年沢村賞レース
      </h1>

      <div className="overflow-x-auto">

        <table className="border-collapse border w-full text-sm border-gray-400 dark:border-gray-600">

          <thead>

            <tr className="bg-gray-200 dark:bg-gray-800">

              <th
                className="border p-2 border-gray-400 dark:border-gray-600"
                rowSpan={2}
              >
                選手名
              </th>

              <th
                className="border p-2 border-gray-400 dark:border-gray-600"
                rowSpan={2}
              >
                球団
              </th>

              <th
                className="border p-2 border-gray-400 dark:border-gray-600"
                colSpan={7}
              >
                現在の成績
              </th>

              <th
                className="border p-2 border-gray-400 dark:border-gray-600"
                colSpan={10}
              >
                143試合換算
              </th>

            </tr>

            <tr className="bg-gray-100 dark:bg-gray-700">
            
              {/* 現在成績 */}
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("防御率")}
              >
                防御率
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("登板")}
              >
                登板
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("完投")}
              >
                完投
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("勝利")}
              >
                勝利
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("勝率")}
              >
                勝率
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("投球回")}
              >
                投球回
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("奪三振")}
              >
                奪三振
              </th>
            
              {/* 143試合換算 */}
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算防御率")}
              >
                防御率
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算登板")}
              >
                登板
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算完投")}
              >
                完投
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算勝利")}
              >
                勝利
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算勝率")}
              >
                勝率
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算投球回")}
              >
                投球回
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("143試合換算奪三振")}
              >
                奪三振
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("基準達成数")}
              >
                基準達成数
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("沢村賞受賞回数")}
              >
                沢村賞
              </th>
            
              <th
                className="border p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleSort("SAP")}
              >
                SAP
              </th>
            
            </tr>

          </thead>

          <tbody>

            {sortedPlayers.map((player, index) => (

              <tr
                key={index}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >

                <td className="border p-2 font-bold">
                  {player["選手名"]}
                </td>

                <td className="border p-2">
                  {player["球団"]}
                </td>

                {/* 現在成績 */}

                <td className="border p-2">
                  {formatERA(player["防御率"])}
                </td>

                <td className="border p-2">
                  {player["登板"]}
                </td>

                <td className="border p-2">
                  {player["完投"]}
                </td>

                <td className="border p-2">
                  {player["勝利"]}
                </td>

                <td className="border p-2">
                  {formatWinPct(player["勝率"])}
                </td>

                <td className="border p-2">
                  {formatOneDecimal(player["投球回"])}
                </td>

                <td className="border p-2">
                  {player["奪三振"]}
                </td>

                {/* 143試合換算 */}

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算防御率"] <= 2.5
                  )}`}
                >
                  {formatERA(player["143試合換算防御率"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算登板"] >= 25
                  )}`}
                >
                  {formatOneDecimal(player["143試合換算登板"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算完投"] >= 8
                  )}`}
                >
                  {formatOneDecimal(player["143試合換算完投"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算勝利"] >= 15
                  )}`}
                >
                  {formatOneDecimal(player["143試合換算勝利"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算勝率"] >= 0.6
                  )}`}
                >
                  {formatWinPct(player["143試合換算勝率"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算投球回"] >= 180
                  )}`}
                >
                  {formatOneDecimal(player["143試合換算投球回"])}
                </td>

                <td
                  className={`border p-2 ${highlightClass(
                    player["143試合換算奪三振"] >= 150
                  )}`}
                >
                  {formatOneDecimal(player["143試合換算奪三振"])}
                </td>

                <td className="border p-2 font-bold text-center">
                  {player["基準達成数"]}
                </td>

                <td className="border p-2 text-center">
                  {player["沢村賞受賞回数"]}
                </td>

                <td className="border p-2 font-bold text-center">
                  {formatSAP(
                    Number(player["SAP"]),
                    sapValues
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          更新日時: {updatedAt}
        </p>

      </div>

    </main>
  )
}