"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { Monke } from "../types"
import { fetchMonkes } from "../utils/api"
import MonkeItem from "./MonkeItem"
import SearchBar from "./SearchBar"
import Pagination from "./Pagination"
import "./MonkesList.css"

const ITEMS_PER_PAGE = 10

const MonkesList: React.FC = () => {
  const [allMonkes, setAllMonkes] = useState<Monke[]>([])
  const [filteredMonkes, setFilteredMonkes] = useState<Monke[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBody, setSelectedBody] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMonkes = async () => {
      try {
        console.log("Loading monkes data...")
        const data = await fetchMonkes()
        console.log("Loaded data:", data)

        // 确保数据是数组格式
        const monkesArray = Array.isArray(data) ? data : []
        setAllMonkes(monkesArray)
        setFilteredMonkes(monkesArray)
        setLoading(false)
      } catch (err) {
        console.error("Error loading monkes:", err)
        setError("Failed to load monkes. Please try again.")
        setLoading(false)
      }
    }

    loadMonkes()
  }, [])

  const handleSearch = useCallback(
    (term: string, body: string) => {
      setSearchTerm(term)
      setSelectedBody(body)
      let filtered = allMonkes

      if (term) {
        const searchNumber = Number.parseInt(term)
        filtered = allMonkes.filter((monke) => monke.id === searchNumber || monke.inscription === searchNumber)
      }

      if (body !== "all") {
        filtered = filtered.filter((monke) => monke.attributes && monke.attributes.Body === body)
      }

      filtered.sort((a, b) => (a.rank || Number.POSITIVE_INFINITY) - (b.rank || Number.POSITIVE_INFINITY))
      setFilteredMonkes(filtered)
      setCurrentPage(1)
    },
    [allMonkes],
  )

  if (loading) return <div className="loading">Loading NODEMONKES...</div>
  if (error) return <div className="error">{error}</div>

  const pageCount = Math.ceil(filteredMonkes.length / ITEMS_PER_PAGE)
  const pageMonkes = filteredMonkes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // 安全地获取body类型
  const bodyTypes = [
    ...new Set(allMonkes.map((m) => m.attributes?.Body).filter((body) => body !== undefined && body !== null)),
  ].sort()

  return (
    <div className="monkes-container">
      <h2 id="bodyTitle">{selectedBody === "all" ? "All Monkes" : selectedBody}</h2>
      <SearchBar onSearch={handleSearch} bodyTypes={bodyTypes} />
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>NODEMONKE</th>
              <th>COLOR</th>
              <th>TRAITS</th>
              <th>RANK</th>
              <th>INSCRIPTION #</th>
              <th>BLOCK HEIGHT</th>
              <th>SCRIPT PUBKEY</th>
            </tr>
          </thead>
          <tbody>
            {pageMonkes.map((monke, index) => (
              <MonkeItem key={monke.id || index} monke={monke} index={index} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
    </div>
  )
}

export default MonkesList
