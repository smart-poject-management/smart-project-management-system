const DataTable = ({ columns, rows, emptyMessage = "No records found.", rowClassName = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 md:px-6 py-3 whitespace-nowrap">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr
              key={row.key || rowIndex}
              className={`transition-colors hover:bg-slate-50 ${rowClassName}`}
            >
              {columns.map((column) => (
                <td key={`${column.key}-${row.key || rowIndex}`} className="px-4 md:px-6 py-4 align-top">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
