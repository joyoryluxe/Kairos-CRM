const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'EditsPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports Update
content = content.replace(
  /import {[^}]*CheckCircle2\n} from "lucide-react";/,
  `import {
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronUp,
  X,
  Hash,
  ArrowRight,
  Download,
  CheckCircle2,
  TrendingUp,
  Package,
  CreditCard
} from "lucide-react";`
);

content = content.replace(
  /import { exportToExcel } from "@\/utils\/exportToExcel";/,
  `import { exportToExcel } from "@/utils/exportToExcel";
import StatCard from "@/components/StatCard";

// Shared currency formatter
const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
};`
);

// 2. Extract data and summary from query
content = content.replace(
  /const { data: edits = \[\], isLoading, isError } = useQuery\({/,
  `const { data: response, isLoading, isError } = useQuery({`
);

// We need to add the destructuring after `useQuery`:
content = content.replace(
  /queryFn: \(\) => getEdits\(\),\n  }\);\n\n  const deleteMutation/,
  `queryFn: () => getEdits(),
  });

  const edits = response?.data || [];
  const apiSummary = response?.summary || {};

  const summary = {
    totalRecords: apiSummary.totalRecords || 0,
    totalRevenue: apiSummary.totalRevenue || 0,
    totalReceived: apiSummary.totalReceived || 0,
    totalDue: apiSummary.totalDue || 0,
    totalExpenses: apiSummary.totalExpenses || 0,
    totalProfit: apiSummary.totalProfit || 0
  };

  const deleteMutation`
);


// 3. Add StatCards to UI before the Filter Bar
content = content.replace(
  /<\/div>\n\n      {\/\* ── Premium Responsive Date Range Filter Bar ── \*\/}/,
  `</div>

      {/* Summary Cards */}
      <div className="grid-responsive" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2.5rem"
      }}>
        <StatCard
          title="Total Records"
          value={summary.totalRecords}
          icon={<Package size={24} />}
          color="var(--color-primary)"
          description="Total tasks"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<TrendingUp size={24} />}
          color="#f472b6"
          description="Gross value"
        />
        <StatCard
          title="Received"
          value={formatCurrency(summary.totalReceived)}
          icon={<CheckCircle2 size={24} />}
          color="#34d399"
          description="Collected"
        />
        <StatCard
          title="Total Due"
          value={formatCurrency(summary.totalDue)}
          icon={<AlertCircle size={24} />}
          color="#f87171"
          description="Pending"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<CreditCard size={24} />}
          color="#fbbf24"
          description="Costs"
        />
        <StatCard
          title="Estimated Profit"
          value={formatCurrency(summary.totalProfit)}
          icon={<TrendingUp size={24} />}
          color="#60a5fa"
          description="Net profit"
        />
      </div>

      {/* ── Premium Responsive Date Range Filter Bar ── */}`
);

fs.writeFileSync(filePath, content);
console.log('Done replacing in EditsPage.tsx');
