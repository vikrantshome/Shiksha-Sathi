"use client";

import React, { useState, useEffect } from "react";
import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Column {
  key: string;
  header: string;
  width?: string;
  editable?: boolean;
}

interface CellChange {
  rowId: string;
  colKey: string;
  value: number;
  originalValue: number;
}

interface DataGridProps {
  columns: Column[];
  data: Record<string, unknown>[];
  rowKey: string;
  onCellChange?: (rowId: string, colKey: string, value: unknown) => void;
  onBatchSave?: (changes: CellChange[]) => Promise<void>;
  getCellBadge?: (rowId: string, colKey: string, value: unknown) => React.ReactNode | undefined;
  getCellClassName?: (rowId: string, colKey: string, value: unknown) => string | undefined;
  batchEdit?: boolean;
}

/* ── Confirmation Dialog ── */
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-xl p-6 max-w-sm w-full shadow-lg"
        style={{ background: "var(--color-surface-container-lowest)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-on-surface)] m-0">{title}</h3>
        </div>
        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{ background: "var(--color-error)", color: "var(--color-on-error)" }}
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DataGrid({
  columns,
  data,
  rowKey,
  onCellChange,
  onBatchSave,
  getCellBadge,
  getCellClassName,
  batchEdit = false,
}: DataGridProps) {
  const [localData, setLocalData] = useState<Record<string, unknown>[]>(data);
  const [dirtyCells, setDirtyCells] = useState<Record<string, { value: number; original: number }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    setLocalData(data);
    setDirtyCells({});
  }, [data]);

  const handleChange = (rowId: string, colKey: string, value: string, originalValue: number) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    const cellKey = `${rowId}::${colKey}`;

    setDirtyCells((prev) => {
      if (num === originalValue) {
        const next = { ...prev };
        delete next[cellKey];
        return next;
      }
      return { ...prev, [cellKey]: { value: num, original: originalValue } };
    });

    // Also update localData for immediate visual feedback
    setLocalData((prev) =>
      prev.map((row) => {
        if (String(row[rowKey]) === rowId) {
          return { ...row, [colKey]: num };
        }
        return row;
      })
    );

    // Legacy single-cell save (if batchEdit is false)
    if (!batchEdit && onCellChange) {
      onCellChange(rowId, colKey, num);
    }
  };

  const dirtyCount = Object.keys(dirtyCells).length;
  const hasChanges = dirtyCount > 0;

  const handleSave = async () => {
    if (!hasChanges || !onBatchSave) return;
    const changes: CellChange[] = Object.entries(dirtyCells).map(([cellKey, v]) => {
      const [rowId, colKey] = cellKey.split("::");
      return { rowId, colKey, value: v.value, originalValue: v.original };
    });
    setIsSaving(true);
    try {
      await onBatchSave(changes);
      setDirtyCells({});
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!hasChanges) return;
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    // Revert all dirty cells in localData
    setLocalData((prev) =>
      prev.map((row) => {
        const rowId = String(row[rowKey]);
        const nextRow = { ...row };
        Object.entries(dirtyCells).forEach(([cellKey, v]) => {
          const [rId, colKey] = cellKey.split("::");
          if (rId === rowId) {
            nextRow[colKey] = v.original;
          }
        });
        return nextRow;
      })
    );
    setDirtyCells({});
    setShowCancelConfirm(false);
  };

  const isCellDirty = (rowId: string, colKey: string) => {
    return dirtyCells[`${rowId}::${colKey}`] !== undefined;
  };

  const getDirtyValue = (rowId: string, colKey: string) => {
    return dirtyCells[`${rowId}::${colKey}`];
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-20rem)] border border-[var(--color-outline-variant)]/30 rounded-xl bg-[var(--color-surface-container-lowest)] shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className="sticky top-0 z-10"
            style={{ background: "var(--color-surface-container)" }}
          >
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={`p-3 font-black uppercase tracking-[0.1em] text-[0.65rem] text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)]/30 ${
                    i === 0
                      ? "sticky left-0 z-20"
                      : ""
                  }`}
                  style={{
                    minWidth: col.width || "120px",
                    background: i === 0 ? "var(--color-surface-container)" : undefined,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
            {localData.map((row) => {
              const rowId = String(row[rowKey]);
              return (
                <tr
                  key={rowId}
                  className="hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  {columns.map((col, i) => {
                    const cellValue = row[col.key];
                    const cellId = `${rowId}-${col.key}`;
                    const badgeNode = getCellBadge?.(rowId, col.key, cellValue);
                    const extraClassName = getCellClassName?.(rowId, col.key, cellValue);
                    const dirty = isCellDirty(rowId, col.key);
                    const dirtyInfo = getDirtyValue(rowId, col.key);

                    return (
                      <td
                        key={cellId}
                        className={`p-0 border-r border-[var(--color-outline-variant)]/10 last:border-r-0 relative ${
                          i === 0
                            ? "sticky left-0 z-10 px-4 py-3 font-semibold text-[var(--color-on-surface)] shadow-[1px_0_0_rgba(192,200,198,0.3)]"
                            : "px-4 py-3 text-[var(--color-on-surface-variant)]"
                        } ${extraClassName || ""}`}
                        style={i === 0 ? { background: "var(--color-surface-container-lowest)" } : undefined}
                      >
                        {col.editable && batchEdit ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={Number(cellValue)}
                              onChange={(e) =>
                                handleChange(
                                  rowId,
                                  col.key,
                                  e.target.value,
                                  dirtyInfo?.original ?? Number(cellValue)
                                )
                              }
                              className={`w-full h-full p-0 text-center bg-transparent outline-none font-bold transition-all ${
                                dirty
                                  ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                                  : "text-[var(--color-on-surface)] border-b-2 border-transparent focus:border-[var(--color-primary)]"
                              }`}
                            />
                            {dirty && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </div>
                        ) : col.editable ? (
                          <input
                            type="number"
                            defaultValue={Number(cellValue)}
                            onBlur={(e) =>
                              onCellChange?.(rowId, col.key, e.target.value)
                            }
                            className="w-full h-full p-0 text-center bg-transparent outline-none focus:text-[var(--color-on-surface)] font-bold transition-all border-b-2 border-transparent focus:border-[var(--color-primary)]"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            {String(cellValue ?? "")}
                            {badgeNode}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ Batch Edit Bar ═══ */}
      {batchEdit && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl border"
          style={{
            background: "var(--color-surface-container-low)",
            borderColor: "var(--color-outline-variant)",
          }}
        >
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                  {dirtyCount} cell{dirtyCount !== 1 ? "s" : ""} modified
                </span>
              </>
            ) : (
              <span className="text-xs text-[var(--color-on-surface-variant)]">
                All changes saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-40 active:scale-[0.96]"
              style={{
                background: hasChanges
                  ? "var(--color-primary)"
                  : "var(--color-surface-container-high)",
                color: hasChanges
                  ? "var(--color-on-primary)"
                  : "var(--color-on-surface-variant)",
              }}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Confirmation Dialog ═══ */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Discard Changes?"
        message={`You have ${dirtyCount} unsaved grade change${dirtyCount !== 1 ? "s" : ""} in the worksheet. Cancelling will revert all cells to their original values.`}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
