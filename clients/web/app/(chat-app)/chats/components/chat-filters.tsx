'use client'

const filters = {
  all: 'All',
  unread: 'Unread',
  groups: 'Groups'
} as const;

export type FilterType = keyof typeof filters;
interface ChatFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
}


export function ChatFilters({ activeFilter, setActiveFilter }: ChatFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      {Object.keys(filters).map(f =>
        <button
          onClick={() => setActiveFilter(f as FilterType)}
          className={`px-4 py-2 rounded-lg cursor-pointer ${activeFilter === f
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent hover:bg-accent/80'
            }`}
          key={f}
        >
          {filters[f as FilterType]}
        </button>
      )}
    </div>
  );
} 