// Jest用のセットアップファイル
import '@testing-library/jest-dom'
import {TextDecoder, TextEncoder} from 'util'

// mock用のグローバル設定
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// localStorageのモック（状態付き実装でgetItem/setItemが連動して動作する）
let store = {}
const localStorageMock = {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = String(value) }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
}
Object.defineProperty(window, 'localStorage', {value: localStorageMock, writable: true})

// fetchのモック（テスト時に必要に応じて使用）
global.fetch = jest.fn()
