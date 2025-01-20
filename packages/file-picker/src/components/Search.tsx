import React, { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react'

export interface Props {
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  isSearchVisible: boolean
  setIsSearchVisible: Dispatch<SetStateAction<boolean>>
}

const Search = ({ setSearchTerm, searchTerm, isSearchVisible, setIsSearchVisible }: Props) => {
  const inputEl = useRef(null) as any

  const handleClick = () => {
    if (isSearchVisible) {
      setSearchTerm('')
      setIsSearchVisible(false)
    } else {
      setIsSearchVisible(true)
      setTimeout(() => {
        inputEl.current?.focus()
      }, 0)
    }
  }

  return isSearchVisible ? (
    <div className="h-5">
      <div className="absolute w-full -inset-x-0 -top-2">
        <div className="relative">
          <button className="absolute right-2 top-2" onClick={() => handleClick()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400 transition duration-150 hover:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <input
            className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border border-gray-200 rounded shadow-sm appearance-none focus:outline-none focus:shadow-outline"
            name="search"
            placeholder="Search"
            autoComplete="off"
            ref={inputEl}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
            value={searchTerm}
          />
        </div>
      </div>
    </div>
  ) : (
    <button className="" onClick={() => handleClick()}>
      <svg
        className="w-5 h-5 text-gray-400 transition duration-150 hover:text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

export default Search
