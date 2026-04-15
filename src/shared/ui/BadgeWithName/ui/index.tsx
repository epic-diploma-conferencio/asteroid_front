import { Diamond } from 'lucide-react';

import { Badge } from '@/shared/ui/Badge';
import { Text } from '@/shared/ui/Text';

export const BadgeWithName = () => (
  <div className="Header__name-and-icon">
    <Badge rounded>
      <Diamond />
    </Badge>

    <Text style="MicroHeading">KinChat</Text>
  </div>
);
