'use client';

import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface MemberSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
}

export function MemberSelect({
  options,
  selected,
  onChange,
}: MemberSelectProps) {
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((member) => (
        <Badge
          key={member.value}
          variant={selected.includes(member.value) ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 flex items-center gap-1"
          onClick={() => handleSelect(member.value)}
        >
          {selected.includes(member.value) && <Check className="h-3 w-3" />}
          {member.label}
        </Badge>
      ))}
    </div>
  );
}
