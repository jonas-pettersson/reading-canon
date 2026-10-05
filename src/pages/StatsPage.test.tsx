import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatsPage } from './StatsPage'
import { useReadingStats } from '@/features/reading/hooks/useReadingStats'

vi.mock('@/features/reading/hooks/useReadingStats')

const mockUseReadingStats = vi.mocked(useReadingStats)

function renderStatsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <StatsPage />
    </QueryClientProvider>
  )
}

describe('StatsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Reading Status Counts (FR-030)', () => {
    it('displays want to read count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 15,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Want to Read')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('displays currently reading count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 3,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Currently Reading')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('displays paused count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 2,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Paused')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('displays finished count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 42,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Finished')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('displays abandoned count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 1,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Abandoned')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Ownership Counts (FR-031)', () => {
    it('displays owned physical count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 25,
            owned_digital: 10,
            borrowed: 0,
            totalOwned: 35,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Owned (Physical)')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('displays owned digital count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 5,
            owned_digital: 18,
            borrowed: 0,
            totalOwned: 23,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Owned (Digital)')).toBeInTheDocument()
      expect(screen.getByText('18')).toBeInTheDocument()
    })

    it('displays total owned count', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 25,
            owned_digital: 18,
            borrowed: 0,
            totalOwned: 43,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Total Owned')).toBeInTheDocument()
      expect(screen.getByText('43')).toBeInTheDocument()
    })
  })

  describe('Zero Counts', () => {
    it('displays zero for all stats when no data', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      // Check that we have multiple "0" values displayed
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State', () => {
    it('displays loading message while data is loading', () => {
      mockUseReadingStats.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('displays page title', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByRole('heading', { name: /statistics/i, level: 1 })).toBeInTheDocument()
    })

    it('displays reading status section heading', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByRole('heading', { name: /reading status/i, level: 2 })).toBeInTheDocument()
    })

    it('displays ownership section heading', () => {
      mockUseReadingStats.mockReturnValue({
        data: {
          byReadingStatus: {
            not_started: 0,
            want_to_read: 0,
            reading: 0,
            paused: 0,
            finished: 0,
            abandoned: 0,
          },
          byOwnership: {
            not_owned: 0,
            ordered: 0,
            owned_physical: 0,
            owned_digital: 0,
            borrowed: 0,
            totalOwned: 0,
          },
        },
        isLoading: false,
        error: null,
      } as any)

      renderStatsPage()

      expect(screen.getByRole('heading', { name: /ownership/i, level: 2 })).toBeInTheDocument()
    })
  })
})
