import { describe, it, expect, beforeEach } from 'vitest'
import { parseExcelFile } from './excel-parser'
import XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// Helper to create a test Excel file
function createTestExcelFile(rows: any[], filePath: string): void {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filePath)
}

describe('parseExcelFile', () => {
  const testFilePath = path.join(__dirname, 'test-data.xlsx')

  beforeEach(() => {
    // Clean up test file if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  describe('basic parsing', () => {
    it('should read Excel file and parse book rows correctly', () => {
      const testData = [
        {
          'Author': 'Homer',
          'Title (EN)': 'The Odyssey',
          'Year': '8th century BC',
          'Sort Time': -750,
          'Category': 'Epic',
          'Original Language': 'Ancient Greek',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toBe('The Odyssey')
      expect(result.books[0].author_display_name).toBe('Homer')
      expect(result.books[0].year_published).toBe('8th century BC')
      expect(result.books[0].year_sort).toBe(-750)
      expect(result.books[0].original_language).toBe('Ancient Greek')
    })

    it('should handle missing optional fields', () => {
      const testData = [
        {
          'Author': 'Unknown',
          'Title (EN)': 'Beowulf',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books).toHaveLength(1)
      expect(result.books[0].title).toBe('Beowulf')
      expect(result.books[0].author_display_name).toBe('Unknown')
      expect(result.books[0].year_published).toBeUndefined()
      expect(result.books[0].original_language).toBeUndefined()
      expect(result.validationErrors).toHaveLength(0)
    })

    it('should skip rows with missing required fields', () => {
      const testData = [
        {
          'Author': 'Homer',
          // Missing Title (EN)
        },
        {
          // Missing Author
          'Title (EN)': 'Some Book',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      // Rows with missing required fields are skipped (not validation errors)
      expect(result.skippedRows.length).toBeGreaterThan(0)
      expect(result.skippedRows.some(err => err.includes('Title'))).toBe(true)
      expect(result.skippedRows.some(err => err.includes('Author'))).toBe(true)
      expect(result.books.length).toBe(0) // Both rows skipped
    })
  })

  describe('author model variations', () => {
    it('should use Author column as author_display_name when present', () => {
      const testData = [
        {
          'Author': 'Homer',
          'Title (EN)': 'The Iliad',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_display_name).toBe('Homer')
      expect(result.books[0].family_name).toBeUndefined()
      expect(result.books[0].given_name).toBeUndefined()
    })

    it('should construct author_display_name from Last Name and First Name', () => {
      const testData = [
        {
          'Last Name': 'Tolstoy',
          'First Name': 'Leo',
          'Title (EN)': 'War and Peace',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_display_name).toBe('Tolstoy, Leo')
      expect(result.books[0].family_name).toBe('Tolstoy')
      expect(result.books[0].given_name).toBe('Leo')
    })

    it('should use Last Name alone if First Name is missing', () => {
      const testData = [
        {
          'Last Name': 'Aristotle',
          'Title (EN)': 'Nicomachean Ethics',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_display_name).toBe('Aristotle')
      expect(result.books[0].family_name).toBe('Aristotle')
      expect(result.books[0].given_name).toBeUndefined()
    })

    it('should prefer Author column over Last Name + First Name when both present', () => {
      const testData = [
        {
          'Author': 'Brothers Grimm',
          'Last Name': 'Grimm',
          'First Name': 'Jacob and Wilhelm',
          'Title (EN)': 'Grimms\' Fairy Tales',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_display_name).toBe('Brothers Grimm')
      // Should still capture parsed names for sorting/filtering
      expect(result.books[0].family_name).toBe('Grimm')
      expect(result.books[0].given_name).toBe('Jacob and Wilhelm')
    })

    it('should handle unknown and collective authors', () => {
      const testData = [
        {
          'Author': 'Unknown',
          'Title (EN)': 'Epic of Gilgamesh',
        },
        {
          'Author': 'Various Authors',
          'Title (EN)': 'Arabian Nights',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_display_name).toBe('Unknown')
      expect(result.books[1].author_display_name).toBe('Various Authors')
    })
  })

  describe('category and tags mapping', () => {
    it('should normalize category to canonical PRIMARY_CATEGORIES', () => {
      const testData = [
        {
          'Author': 'Homer',
          'Title (EN)': 'The Odyssey',
          'Category': 'epic poem',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].primary_category).toBe('Poetry')
    })

    it('should normalize various novel types to "Novel"', () => {
      const testData = [
        { 'Author': 'Author 1', 'Title (EN)': 'Book 1', 'Category': 'novel' },
        { 'Author': 'Author 2', 'Title (EN)': 'Book 2', 'Category': 'novella' },
        { 'Author': 'Author 3', 'Title (EN)': 'Book 3', 'Category': 'short story' },
        { 'Author': 'Author 4', 'Title (EN)': 'Book 4', 'Category': 'thriller' },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].primary_category).toBe('Novel')
      expect(result.books[1].primary_category).toBe('Novel')
      expect(result.books[2].primary_category).toBe('Novel')
      expect(result.books[3].primary_category).toBe('Novel')
    })

    it('should normalize various drama types to "Play / Drama"', () => {
      const testData = [
        { 'Author': 'Author 1', 'Title (EN)': 'Book 1', 'Category': 'play' },
        { 'Author': 'Author 2', 'Title (EN)': 'Book 2', 'Category': 'comedy' },
        { 'Author': 'Author 3', 'Title (EN)': 'Book 3', 'Category': 'tragedy' },
        { 'Author': 'Author 4', 'Title (EN)': 'Book 4', 'Category': 'drama' },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].primary_category).toBe('Play / Drama')
      expect(result.books[1].primary_category).toBe('Play / Drama')
      expect(result.books[2].primary_category).toBe('Play / Drama')
      expect(result.books[3].primary_category).toBe('Play / Drama')
    })

    it('should handle unmapped categories by setting to undefined', () => {
      const testData = [
        {
          'Author': 'Unknown Author',
          'Title (EN)': 'Unknown Book',
          'Category': 'unknown-genre-xyz',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      // Unmapped categories are set to undefined and logged as warnings
      expect(result.books[0].primary_category).toBeUndefined()
    })

    it('should combine Genre and Subject into tags array', () => {
      const testData = [
        {
          'Author': 'Tolkien',
          'Title (EN)': 'The Lord of the Rings',
          'Genre': 'Fantasy',
          'Subject': 'Adventure',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].tags).toEqual(expect.arrayContaining(['Fantasy', 'Adventure']))
      expect(result.books[0].tags).toHaveLength(2)
    })

    it('should handle Genre or Subject alone', () => {
      const testData = [
        {
          'Author': 'Author A',
          'Title (EN)': 'Book A',
          'Genre': 'Science Fiction',
        },
        {
          'Author': 'Author B',
          'Title (EN)': 'Book B',
          'Subject': 'Politics',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].tags).toEqual(['Science Fiction'])
      expect(result.books[1].tags).toEqual(['Politics'])
    })

    it('should handle missing Category, Genre, and Subject', () => {
      const testData = [
        {
          'Author': 'Some Author',
          'Title (EN)': 'Some Book',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].primary_category).toBeUndefined()
      expect(result.books[0].tags).toBeUndefined()
    })
  })

  describe('Prio column mapping', () => {
    it('should map "x" to want_to_read', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Want to Read Book',
          'Prio': 'x',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].reading_status).toBe('want_to_read')
      expect(result.userReadingStatuses[0].personal_priority).toBeUndefined()
      expect(result.userReadingStatuses[0].personal_rating).toBeUndefined()
    })

    it('should map numeric values 1-5 to personal_rating (inverted from German grading)', () => {
      const testData = [
        { 'Author': 'A1', 'Title (EN)': 'Book 1', 'Prio': '1' }, // German grade 1 (best) → 5 stars
        { 'Author': 'A2', 'Title (EN)': 'Book 2', 'Prio': '3' }, // German grade 3 → 3 stars
        { 'Author': 'A3', 'Title (EN)': 'Book 3', 'Prio': '5' }, // German grade 5 (worst) → 1 star
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(3)
      expect(result.userReadingStatuses[0].personal_rating).toBe(5) // Inverted: 6 - 1 = 5
      expect(result.userReadingStatuses[1].personal_rating).toBe(3) // Inverted: 6 - 3 = 3
      expect(result.userReadingStatuses[2].personal_rating).toBe(1) // Inverted: 6 - 5 = 1
    })

    it('should ignore "-" in Prio column', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Book with Prio Dash',
          'Prio': '-',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].reading_status).toBe('not_started')
      expect(result.userReadingStatuses[0].personal_priority).toBeUndefined()
      expect(result.userReadingStatuses[0].personal_rating).toBeUndefined()
    })

    it('should handle blank Prio column', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'No Priority Book',
          'Prio': '',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      // Should still create a status record but with defaults
      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].personal_priority).toBeUndefined()
      expect(result.userReadingStatuses[0].personal_rating).toBeUndefined()
      expect(result.userReadingStatuses[0].reading_status).toBe('not_started')
    })

    it('should warn on invalid Prio values', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Invalid Prio',
          'Prio': 'invalid',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.validationWarnings.length).toBeGreaterThan(0)
      expect(result.validationWarnings.some(w => w.includes('Prio'))).toBe(true)
    })
  })

  describe('Lib column mapping (ownership)', () => {
    it('should map "X" to owned_physical', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Owned Book',
          'Lib': 'X',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].ownership_status).toBe('owned_physical')
    })

    it('should map blank to not_owned', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Not Owned Book',
          'Lib': '',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].ownership_status).toBe('not_owned')
    })

    it('should handle case-insensitive "x"', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Owned Book',
          'Lib': 'x',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].ownership_status).toBe('owned_physical')
    })
  })

  describe('Read column mapping (reading_status)', () => {
    it('should map "X" to finished', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Finished Book',
          'Read': 'X',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].reading_status).toBe('finished')
    })

    it('should map blank to not_started', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Not Started Book',
          'Read': '',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses).toHaveLength(1)
      expect(result.userReadingStatuses[0].reading_status).toBe('not_started')
    })

    it('should handle case-insensitive "x"', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Finished Book',
          'Read': 'x',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].reading_status).toBe('finished')
    })

    it('should map "-" to reading (currently reading)', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Currently Reading',
          'Read': '-',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].reading_status).toBe('reading')
    })

    it('should handle case-insensitive "-"', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Currently Reading',
          'Read': '-',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].reading_status).toBe('reading')
    })

    it('should prioritize Prio "x" (want_to_read) over Read blank', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Want to Read',
          'Prio': 'x',
          'Read': '',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].reading_status).toBe('want_to_read')
    })

    it('should prioritize Read "-" (reading) over Prio "x" (want_to_read)', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Currently Reading',
          'Prio': 'x',
          'Read': '-',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.userReadingStatuses[0].reading_status).toBe('reading')
    })
  })

  describe('additional fields', () => {
    it('should map Original Title field', () => {
      const testData = [
        {
          'Author': 'Dostoevsky',
          'Title (EN)': 'Crime and Punishment',
          'Original Title': 'Преступление и наказание',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].title_original).toBe('Преступление и наказание')
    })

    it('should map Source field', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Test Book',
          'Source': 'Wikipedia',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].source).toBe('Wikipedia')
    })

    it('should map Comment to inclusion_rationale', () => {
      const testData = [
        {
          'Author': 'Test Author',
          'Title (EN)': 'Test Book',
          'Comment': 'Foundation of Western philosophy',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].inclusion_rationale).toBe('Foundation of Western philosophy')
    })

    it('should map Author Lifespan field', () => {
      const testData = [
        {
          'Author': 'Shakespeare',
          'Title (EN)': 'Hamlet',
          'Author Lifespan': '1564-1616',
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books[0].author_lifespan).toBe('1564-1616')
    })
  })

  describe('comprehensive data validation', () => {
    it('should process multiple books with mixed data quality', () => {
      const testData = [
        {
          'Author': 'Homer',
          'Title (EN)': 'The Odyssey',
          'Year': '8th century BC',
          'Sort Time': -750,
          'Category': 'Epic',
          'Read': 'X',  // Finished reading
        },
        {
          'Last Name': 'Tolstoy',
          'First Name': 'Leo',
          'Title (EN)': 'War and Peace',
          'Year': '1869',
          'Sort Time': 1869,
          'Genre': 'Historical Fiction',
          'Lib': 'X',
          'Prio': '5',  // Rating: German grade 5 → 1 star
        },
        {
          'Author': 'Kafka',
          'Title (EN)': 'The Trial',
          'Prio': 'x',  // Want to read
        },
        {
          'Author': 'Unknown',
          'Title (EN)': 'Beowulf',
          // Minimal data
        },
      ]
      createTestExcelFile(testData, testFilePath)

      const result = parseExcelFile(testFilePath)

      expect(result.books).toHaveLength(4)
      expect(result.userReadingStatuses).toHaveLength(4)
      expect(result.validationErrors).toHaveLength(0)

      // Verify first book (finished reading)
      expect(result.books[0].author_display_name).toBe('Homer')
      expect(result.userReadingStatuses[0].reading_status).toBe('finished')

      // Verify second book (rated, owned)
      expect(result.books[1].author_display_name).toBe('Tolstoy, Leo')
      expect(result.userReadingStatuses[1].personal_rating).toBe(1) // German grade 5 → 1 star (inverted)
      expect(result.userReadingStatuses[1].ownership_status).toBe('owned_physical')

      // Verify third book (want to read)
      expect(result.books[2].author_display_name).toBe('Kafka')
      expect(result.userReadingStatuses[2].reading_status).toBe('want_to_read')

      // Verify fourth book (minimal)
      expect(result.books[3].author_display_name).toBe('Unknown')
    })
  })
})
