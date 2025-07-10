"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, RotateCcw } from "lucide-react"

const sampleParagraphs = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps improve finger dexterity and keyboard familiarity.",
  "Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, innovation continues to shape our future in unprecedented ways.",
  "Reading books opens up new worlds of imagination and knowledge. Literature has the power to transport us to different times and places, allowing us to experience life through various perspectives.",
  "Cooking is both an art and a science that brings people together. The combination of fresh ingredients, proper techniques, and creativity can result in memorable meals and lasting friendships.",
  "Exercise and physical activity are essential for maintaining good health and mental well-being. Regular movement helps strengthen muscles, improve cardiovascular health, and boost mood naturally.",
  "Music has the unique ability to evoke emotions and create lasting memories. Whether classical, jazz, rock, or electronic, different genres speak to people in different and personal ways.",
  "Travel broadens our understanding of different cultures and ways of life. Exploring new destinations challenges our assumptions and helps us grow as individuals through diverse experiences.",
  "Environmental conservation is crucial for preserving our planet for future generations. Small actions like recycling, reducing waste, and using renewable energy can make a significant collective impact.",
  "Artificial intelligence is transforming industries and creating new possibilities for human creativity. Machine learning algorithms can now recognize patterns, make predictions, and solve complex problems.",
  "The ocean covers more than seventy percent of Earth's surface and contains countless mysteries waiting to be discovered. Marine ecosystems support incredible biodiversity and regulate our planet's climate.",
]

export default function TypingPlatform() {
  const [currentText, setCurrentText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [timeLimit, setTimeLimit] = useState(60) // in seconds
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [completedTexts, setCompletedTexts] = useState(0)
  const [stats, setStats] = useState({
    correctWords: 0,
    incorrectWords: 0,
    accuracy: 0,
    wpm: 0,
  })

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with random paragraph
  useEffect(() => {
    resetGame()
  }, [])

  // Timer effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            finishGame()
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeRemaining])

  const getRandomParagraph = () => {
    return sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)]
  }

  const resetGame = () => {
    const randomParagraph = getRandomParagraph()
    setCurrentText(randomParagraph)
    setUserInput("")
    setIsActive(false)
    setIsFinished(false)
    setTimeRemaining(timeLimit)
    setStartTime(null)
    setCompletedTexts(0)
    setStats({
      correctWords: 0,
      incorrectWords: 0,
      accuracy: 0,
      wpm: 0,
    })
  }

  const startGame = () => {
    if (!isActive && !isFinished) {
      setIsActive(true)
      setStartTime(Date.now())
    }
  }

  const finishGame = () => {
    setIsActive(false)
    setIsFinished(true)
    calculateStats()
  }

  const appendNewText = () => {
    const newParagraph = getRandomParagraph()
    setCurrentText((prevText) => prevText + " " + newParagraph)
    setCompletedTexts((prev) => prev + 1)
  }

  const calculateStats = () => {
    const words = currentText.split(" ")
    const typedWords = userInput.trim().split(" ")

    let correctWords = 0
    let incorrectWords = 0

    typedWords.forEach((typedWord, index) => {
      if (index < words.length) {
        if (typedWord === words[index]) {
          correctWords++
        } else if (typedWord.length > 0) {
          incorrectWords++
        }
      }
    })

    const totalWords = correctWords + incorrectWords
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0
    const timeElapsed = (timeLimit - timeRemaining) / 60 // in minutes
    const wpm = timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0

    setStats({
      correctWords,
      incorrectWords,
      accuracy,
      wpm,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Auto-start when user begins typing
    if (!isActive && !isFinished && value.length === 1) {
      startGame()
    }

    // Prevent typing if game is finished
    if (isFinished) return

    setUserInput(value)

    // Check if user completed the current text
    // We need to check if the trimmed input matches the trimmed current text
    const trimmedInput = value.trim()
    const trimmedCurrentText = currentText.trim()

    if (trimmedInput === trimmedCurrentText) {
      if (timeRemaining > 0) {
        // Append new text if time remaining
        appendNewText()
      } else {
        // Finish game if no time remaining
        finishGame()
      }
    }
  }

  const handleTimeLimitChange = (value: string) => {
    if (isActive) return // Don't allow changes during active game

    const minutes = Number.parseInt(value)
    const seconds = minutes * 60
    setTimeLimit(seconds)
    setTimeRemaining(seconds)
  }

  const renderTextWithHighlights = () => {
    const words = currentText.split(" ")
    const typedWords = userInput.split(" ")
    const currentWordIndex = typedWords.length - 1

    return words.map((word, index) => {
      let className = "px-1 py-0.5 rounded"

      if (index < typedWords.length) {
        const typedWord = typedWords[index]

        // Only show colors for completed words (not the word currently being typed)
        if (index < currentWordIndex || (index === currentWordIndex && userInput.endsWith(" "))) {
          if (typedWord === word) {
            className += " bg-green-200 text-green-800"
          } else if (typedWord.length > 0) {
            className += " bg-red-200 text-red-800"
          }
        }
      }

      return (
        <span key={index} className={className}>
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      )
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Typing Speed Test
          </CardTitle>
          <CardDescription>
            Start typing to begin the test. New content will be automatically added as you complete sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="time-select" className="text-sm font-medium">
                Time Limit:
              </label>
              <Select
                value={Math.floor(timeLimit / 60).toString()}
                onValueChange={handleTimeLimitChange}
                disabled={isActive}
              >
                <SelectTrigger id="time-select" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 min</SelectItem>
                  <SelectItem value="2">2 min</SelectItem>
                  <SelectItem value="3">3 min</SelectItem>
                  <SelectItem value="4">4 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono">
                {formatTime(timeRemaining)}
              </Badge>
              {isActive && <Badge variant="secondary">Active</Badge>}
            </div>

            {completedTexts > 0 && (
              <Badge variant="outline" className="bg-blue-50">
                Completed: {completedTexts} text{completedTexts !== 1 ? "s" : ""}
              </Badge>
            )}

            <div className="flex gap-2">
              <Button onClick={resetGame} variant="outline" className="flex items-center gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Separator />

          {/* Text Display */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border min-h-32">
              <div className="text-lg leading-relaxed font-mono">{renderTextWithHighlights()}</div>
            </div>

            {/* Input Area */}
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              placeholder={
                isFinished ? "Test completed! Click Reset to try again." : "Start typing here to begin the test..."
              }
              disabled={isFinished}
              className="w-full h-32 p-4 border rounded-lg resize-none font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Statistics */}
          {isFinished && (
            <>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.correctWords}</div>
                    <div className="text-sm text-gray-600">Correct Words</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.incorrectWords}</div>
                    <div className="text-sm text-gray-600">Incorrect Words</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.wpm}</div>
                    <div className="text-sm text-gray-600">Words/Min</div>
                  </CardContent>
                </Card>
              </div>
              {completedTexts > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  🎉 Great job! You completed {completedTexts + 1} text{completedTexts !== 0 ? "s" : ""} during this
                  session.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
