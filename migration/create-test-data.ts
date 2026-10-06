import XLSX from 'xlsx'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Creates a test Excel file with diverse sample data covering edge cases.
 * This file is used for migration validation testing.
 */
function createTestExcelFile() {
  const testData = [
    // Ancient work with single author name
    {
      'Author': 'Homer',
      'Title (EN)': 'The Odyssey',
      'Original Title': 'Ὀδύσσεια',
      'Year': '8th century BC',
      'Sort Time': -750,
      'Category': 'Epic',
      'Genre': 'Poetry',
      'Subject': 'Mythology',
      'Original Language': 'Ancient Greek',
      'Source': 'Wikipedia',
      'Comment': 'Foundational work of Western literature',
      'Author Lifespan': 'ca. 8th century BC',
      'Lib': 'X',
      'Prio': '5',
      'Read': 'X',
    },
    // Modern work with Last Name + First Name
    {
      'Last Name': 'Tolstoy',
      'First Name': 'Leo',
      'Title (EN)': 'War and Peace',
      'Original Title': 'Война и миръ',
      'Year': '1869',
      'Sort Time': 1869,
      'Category': 'Novel',
      'Genre': 'Historical Fiction',
      'Subject': 'Philosophy',
      'Original Language': 'Russian',
      'Source': 'Canon recommendation',
      'Comment': 'Epic historical novel about Napoleon\'s invasion',
      'Author Lifespan': '1828-1910',
      'Lib': 'X',
      'Prio': 'x',
      'Read': '',
    },
    // Unknown author
    {
      'Author': 'Unknown',
      'Title (EN)': 'Beowulf',
      'Year': 'ca. 1000',
      'Sort Time': 1000,
      'Category': 'Epic',
      'Genre': 'Poetry',
      'Original Language': 'Old English',
      'Comment': 'Oldest surviving Old English epic poem',
      'Lib': '',
      'Prio': '',
      'Read': '',
    },
    // Collective authors
    {
      'Author': 'Brothers Grimm',
      'Title (EN)': 'Grimms\' Fairy Tales',
      'Original Title': 'Kinder- und Hausmärchen',
      'Year': '1812',
      'Sort Time': 1812,
      'Category': 'Folklore',
      'Genre': 'Fairy Tales',
      'Original Language': 'German',
      'Lib': 'X',
      'Prio': '4',
      'Read': 'X',
    },
    // Currently reading (Prio = -)
    {
      'Last Name': 'Dostoevsky',
      'First Name': 'Fyodor',
      'Title (EN)': 'Crime and Punishment',
      'Original Title': 'Преступление и наказание',
      'Year': '1866',
      'Sort Time': 1866,
      'Category': 'Novel',
      'Genre': 'Psychological Fiction',
      'Original Language': 'Russian',
      'Author Lifespan': '1821-1881',
      'Lib': 'X',
      'Prio': '-',
      'Read': '',
    },
    // Minimal data (only required fields)
    {
      'Author': 'Plato',
      'Title (EN)': 'The Republic',
    },
    // Ancient Chinese work
    {
      'Last Name': 'Laozi',
      'Title (EN)': 'Tao Te Ching',
      'Original Title': '道德經',
      'Year': '6th century BC',
      'Sort Time': -550,
      'Category': 'Philosophy',
      'Original Language': 'Classical Chinese',
      'Author Lifespan': 'ca. 6th century BC',
      'Lib': '',
      'Prio': 'x',
      'Read': '',
    },
    // Multiple ratings
    {
      'Author': 'Shakespeare',
      'Title (EN)': 'Hamlet',
      'Year': '1600',
      'Sort Time': 1600,
      'Category': 'Drama',
      'Genre': 'Tragedy',
      'Subject': 'Revenge',
      'Original Language': 'English',
      'Author Lifespan': '1564-1616',
      'Lib': 'X',
      'Prio': '5',
      'Read': 'X',
    },
    {
      'Last Name': 'Austen',
      'First Name': 'Jane',
      'Title (EN)': 'Pride and Prejudice',
      'Year': '1813',
      'Sort Time': 1813,
      'Category': 'Novel',
      'Genre': 'Romance',
      'Original Language': 'English',
      'Author Lifespan': '1775-1817',
      'Lib': 'X',
      'Prio': '4',
      'Read': 'X',
    },
    {
      'Author': 'Dante Alighieri',
      'Title (EN)': 'The Divine Comedy',
      'Original Title': 'Divina Commedia',
      'Year': 'ca. 1320',
      'Sort Time': 1320,
      'Category': 'Epic',
      'Genre': 'Poetry',
      'Subject': 'Theology',
      'Original Language': 'Italian',
      'Author Lifespan': '1265-1321',
      'Lib': '',
      'Prio': 'x',
      'Read': '',
    },
    // Modern work
    {
      'Last Name': 'García Márquez',
      'First Name': 'Gabriel',
      'Title (EN)': 'One Hundred Years of Solitude',
      'Original Title': 'Cien años de soledad',
      'Year': '1967',
      'Sort Time': 1967,
      'Category': 'Novel',
      'Genre': 'Magical Realism',
      'Original Language': 'Spanish',
      'Author Lifespan': '1927-2014',
      'Lib': 'X',
      'Prio': '3',
      'Read': '',
    },
    // Non-fiction
    {
      'Last Name': 'Herodotus',
      'Title (EN)': 'The Histories',
      'Year': 'ca. 430 BC',
      'Sort Time': -430,
      'Category': 'History',
      'Original Language': 'Ancient Greek',
      'Author Lifespan': 'ca. 484 – ca. 425 BC',
      'Comment': 'First work of history in Western literature',
      'Lib': '',
      'Prio': '',
      'Read': '',
    },
    // Islamic Golden Age
    {
      'Author': 'Various Authors',
      'Title (EN)': 'One Thousand and One Nights',
      'Original Title': 'ألف ليلة وليلة',
      'Year': 'ca. 1200-1500',
      'Sort Time': 1350,
      'Category': 'Folklore',
      'Genre': 'Tales',
      'Original Language': 'Arabic',
      'Lib': 'X',
      'Prio': '2',
      'Read': '',
    },
    // Philosophy
    {
      'Last Name': 'Nietzsche',
      'First Name': 'Friedrich',
      'Title (EN)': 'Thus Spoke Zarathustra',
      'Original Title': 'Also sprach Zarathustra',
      'Year': '1883-1885',
      'Sort Time': 1883,
      'Category': 'Philosophy',
      'Genre': 'Fiction',
      'Original Language': 'German',
      'Author Lifespan': '1844-1900',
      'Lib': '',
      'Prio': 'x',
      'Read': '',
    },
    // Asian literature
    {
      'Last Name': 'Murasaki',
      'First Name': 'Shikibu',
      'Title (EN)': 'The Tale of Genji',
      'Original Title': '源氏物語',
      'Year': 'ca. 1010',
      'Sort Time': 1010,
      'Category': 'Novel',
      'Original Language': 'Japanese',
      'Author Lifespan': 'ca. 973 – ca. 1014',
      'Comment': 'World\'s first novel',
      'Lib': 'X',
      'Prio': '1',
      'Read': '',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(testData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Books')

  const filePath = path.join(__dirname, 'test-data.xlsx')
  XLSX.writeFile(wb, filePath)

  console.log(`Test Excel file created: ${filePath}`)
  console.log(`Total books: ${testData.length}`)

  return filePath
}

export { createTestExcelFile }
