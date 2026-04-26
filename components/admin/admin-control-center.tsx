"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  CalendarClock,
  Database,
  Filter,
  Globe2,
  Hash,
  ListFilter,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Type,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminActivityEntry,
  AdminActivityResponse,
  AdminEntityKey,
  AdminFieldConfig,
  AdminItemResponse,
  AdminListResponse,
  AdminLookupOption,
} from "@/lib/admin/types";
import { useAdminPanelMetadata } from "@/lib/hooks/use-admin-panel";
import { useRealtimeGateway } from "@/lib/hooks/use-realtime-gateway";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type ControlCenterEntity = {
  key: AdminEntityKey;
  label: string;
  singularLabel: string;
  description: string;
  primaryKey: string;
  listFields: string[];
  formFields: AdminFieldConfig[];
  searchPlaceholder?: string;
  singleton?: boolean;
  singletonId?: string;
  capability: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  count: number | null;
};

interface AdminControlCenterProps {
  title?: string;
  description?: string;
  allowedEntityKeys?: AdminEntityKey[];
  initialEntityKey?: AdminEntityKey;
}

const EMPTY_SELECT_VALUE = "__empty__";
const ALL_FILTER_VALUE = "__all__";

function formatDateForInput(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function formatEntityLabel(entityKey: string): string {
  return entityKey
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatActivityLabel(item: AdminActivityEntry): string {
  const verb = item.eventType.split(".").at(-1) ?? "updated";
  return `${item.actorName ?? item.actorUserId} ${verb} ${formatEntityLabel(
    item.entityType
  )}`;
}

function buildFormValues(
  entity: ControlCenterEntity,
  item?: Record<string, unknown> | null
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of entity.formFields) {
    const rawValue = item?.[field.key];

    if (field.type === "boolean") {
      result[field.key] = Boolean(rawValue);
      continue;
    }

    if (field.type === "json") {
      result[field.key] = rawValue
        ? JSON.stringify(rawValue, null, 2)
        : JSON.stringify({}, null, 2);
      continue;
    }

    if (field.type === "tags") {
      result[field.key] = Array.isArray(rawValue)
        ? rawValue.join(", ")
        : rawValue
          ? String(rawValue)
          : "";
      continue;
    }

    if (field.type === "datetime") {
      result[field.key] = formatDateForInput(rawValue);
      continue;
    }

    result[field.key] = rawValue == null ? "" : String(rawValue);
  }

  return result;
}

function formatCellValue(
  field: AdminFieldConfig | undefined,
  value: unknown,
  lookups: Record<string, AdminLookupOption[]>
): string {
  if (value == null || value === "") {
    return "-";
  }

  if (field?.lookup) {
    const option = lookups[field.lookup]?.find(
      (entry) => entry.value === String(value)
    );
    return option?.label ?? String(value);
  }

  if (field?.type === "boolean") {
    return value ? "Enabled" : "Disabled";
  }

  if (field?.type === "json") {
    const serialized = JSON.stringify(value);
    return serialized.length > 60
      ? `${serialized.slice(0, 57)}...`
      : serialized;
  }

  if (field?.type === "tags" && Array.isArray(value)) {
    return value.join(", ");
  }

  if (field?.type === "datetime" || field?.type === "date") {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return field.type === "date"
        ? date.toLocaleDateString()
        : date.toLocaleString();
    }
  }

  const nextValue = String(value);
  return nextValue.length > 80 ? `${nextValue.slice(0, 77)}...` : nextValue;
}

function getFieldOptions(
  field: AdminFieldConfig,
  lookups: Record<string, AdminLookupOption[]>
): AdminLookupOption[] {
  if (field.options?.length) {
    return field.options;
  }

  if (field.lookup) {
    return lookups[field.lookup] ?? [];
  }

  return [];
}

function getFieldIcon(field: AdminFieldConfig): ReactNode {
  const signature = `${field.key} ${field.label}`.toLowerCase();

  if (field.type === "email" || signature.includes("email")) {
    return <Mail className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (field.type === "tel" || signature.includes("phone")) {
    return <Phone className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (
    signature.includes("address") ||
    signature.includes("city") ||
    signature.includes("state") ||
    signature.includes("country") ||
    signature.includes("zip")
  ) {
    return <MapPin className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (signature.includes("website") || signature.includes("url")) {
    return <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (field.type === "date" || field.type === "datetime") {
    return <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (
    field.type === "number" ||
    signature.includes("code") ||
    signature.includes("id")
  ) {
    return <Hash className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (field.type === "select") {
    return <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />;
  }

  return <Type className="h-3.5 w-3.5 text-muted-foreground" />;
}
export function AdminControlCenter({
  title = "Control Center",
  description = "Manage live application entities, settings, and permissions from one reusable admin surface.",
  allowedEntityKeys,
  initialEntityKey,
}: AdminControlCenterProps) {
  const {
    data: metadata,
    loading: loadingMetadata,
    error: metadataError,
    refresh: refreshMetadata,
  } = useAdminPanelMetadata();
  const [selectedEntityKey, setSelectedEntityKey] = useState<AdminEntityKey | null>(
    initialEntityKey ?? null
  );
  const [entityData, setEntityData] = useState<AdminListResponse | null>(null);
  const [activity, setActivity] = useState<AdminActivityEntry[]>([]);
  const [activityUnavailable, setActivityUnavailable] = useState(false);
  const [loadingEntity, setLoadingEntity] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [realtimeIssue, setRealtimeIssue] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<
    Record<string, unknown> | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const availableEntities = useMemo(
    () =>
      (metadata?.entities ?? []).filter(
        (entity) => !allowedEntityKeys || allowedEntityKeys.includes(entity.key)
      ),
    [allowedEntityKeys, metadata?.entities]
  );
  const selectedEntity = useMemo(
    () =>
      availableEntities.find((entity) => entity.key === selectedEntityKey) ?? null,
    [availableEntities, selectedEntityKey]
  );
  // Primitive keys are what we actually want to trigger fetches on. Deriving
  // them here means the effects below don't re-run on every metadata snapshot
  // refresh (which mutates object identities but keeps these values stable).
  const selectedEntityFetchKey = selectedEntity?.key ?? null;
  const selectedEntityIsSingleton = selectedEntity?.singleton ?? false;
  const activeLookups = entityData?.lookups ?? metadata?.lookups ?? {};
  const filterFields = useMemo(
    () =>
      (selectedEntity?.formFields ?? []).filter(
        (field) =>
          !field.readOnly &&
          !field.hiddenInList &&
          (field.type === "select" || field.type === "boolean")
      ),
    [selectedEntity]
  );
  const canSearchSelectedEntity = Boolean(selectedEntity?.searchPlaceholder);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const enabledActionCount = selectedEntity
    ? Object.values(selectedEntity.capability).filter(Boolean).length
    : 0;
  const canOpenPrimaryEditor = Boolean(
    selectedEntity &&
      (selectedEntity.singleton
        ? selectedEntity.capability.update || selectedEntity.capability.create
        : selectedEntity.capability.create)
  );

  useEffect(() => {
    if (!availableEntities.length) {
      setSelectedEntityKey(null);
      return;
    }

    const hasCurrentSelection = availableEntities.some(
      (entity) => entity.key === selectedEntityKey
    );

    if (hasCurrentSelection) {
      return;
    }

    const nextSelection =
      (initialEntityKey &&
        availableEntities.find((entity) => entity.key === initialEntityKey)?.key) ||
      availableEntities[0]?.key ||
      null;

    startTransition(() => {
      setSelectedEntityKey(nextSelection);
    });
  }, [availableEntities, initialEntityKey, selectedEntityKey]);

  useEffect(() => {
    setSearch("");
    setFilters({});
  }, [selectedEntityKey]);

  useEffect(() => {
    if (!selectedEntityFetchKey) {
      setEntityData(null);
      return;
    }

    const entityKey = selectedEntityFetchKey;
    const isSingleton = selectedEntityIsSingleton;
    let cancelled = false;

    async function loadEntity() {
      // Only flip the full-page spinner on the first load for this entity.
      // Subsequent refreshes (from Refresh button, mutations, or realtime
      // ticks) refetch silently in the background so the UI doesn't flash.
      setLoadingEntity((previous) => (entityData ? previous : true));
      try {
        const params = new URLSearchParams({
          limit: isSingleton ? "1" : "50",
          offset: "0",
        });

        if (!isSingleton && deferredSearch.trim()) {
          params.set("search", deferredSearch.trim());
        }

        for (const [filterKey, filterValue] of Object.entries(filters)) {
          if (filterValue) {
            params.set(filterKey, filterValue);
          }
        }

        const response = await fetch(
          `/api/admin/entities/${entityKey}?${params.toString()}`,
          { cache: "no-store" }
        );
        const payload = (await response.json().catch(() => ({}))) as
          | AdminListResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            ("error" in payload ? payload.error : undefined) ||
              "Failed to load records"
          );
        }

        if (!cancelled) {
          setEntityData(payload as AdminListResponse);
          setRealtimeIssue((current) =>
            current?.includes("Failed to catch up") ? null : current
          );
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load records"
          );
          setEntityData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingEntity(false);
        }
      }
    }

    void loadEntity();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEntityFetchKey,
    selectedEntityIsSingleton,
    deferredSearch,
    filters,
    refreshTick,
  ]);

  useEffect(() => {
    if (!selectedEntityFetchKey) {
      setActivity([]);
      return;
    }

    const entityKey = selectedEntityFetchKey;
    let cancelled = false;

    async function loadActivity() {
      // Background refreshes should not blank out the activity feed.
      setLoadingActivity((previous) => (activity.length ? previous : true));
      try {
        const response = await fetch(
          `/api/admin/activity?limit=6&entityType=${entityKey}`,
          { cache: "no-store" }
        );
        const payload = (await response.json().catch(() => ({}))) as
          | AdminActivityResponse
          | { error?: string };

        if (!response.ok) {
          if (!cancelled) {
            setActivity([]);
            setActivityUnavailable(true);
          }
          return;
        }

        if (!cancelled) {
          setActivity((payload as AdminActivityResponse).items);
          setActivityUnavailable(false);
        }
      } catch {
        if (!cancelled) {
          setActivity([]);
          setActivityUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingActivity(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntityFetchKey, refreshTick]);

  // Realtime events are used purely to clear any stale "realtime unavailable"
  // badge state. We intentionally do NOT force a table refetch here: the
  // shared admin metadata store already patches live entity counts in place,
  // mutations performed in this panel bump `refreshTick` explicitly, and the
  // Refresh button is available for pulling in externally-made changes. This
  // prevents the list and activity feed from flashing "Loading..." every time
  // an unrelated realtime event arrives.
  useRealtimeGateway({
    enabled: Boolean(metadata?.realtimeFeed),
    feedStreamId: metadata?.realtimeFeed,
    onEvent: () => {
      setRealtimeIssue(null);
    },
    onError: (error) => {
      setRealtimeIssue(error.message);
    },
  });

  function openCreateDialog() {
    if (!selectedEntity) return;
    setEditingItemId(null);
    setFormValues(buildFormValues(selectedEntity));
    setDialogOpen(true);
  }

  function openEditDialog(item: Record<string, unknown>) {
    if (!selectedEntity) return;
    const itemId =
      String(item[selectedEntity.primaryKey] ?? selectedEntity.singletonId ?? "");
    setEditingItemId(itemId);
    setFormValues(buildFormValues(selectedEntity, item));
    setDialogOpen(true);
  }

  function openPrimaryDialog() {
    if (!selectedEntity) return;

    if (selectedEntity.singleton) {
      const currentItem = entityData?.items[0];
      if (currentItem) {
        openEditDialog(currentItem);
        return;
      }
    }

    openCreateDialog();
  }

  function updateFormValue(key: string, value: unknown) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateFilterValue(key: string, value: string) {
    setFilters((current) => {
      const next = { ...current };
      if (!value) {
        delete next[key];
        return next;
      }

      next[key] = value;
      return next;
    });
  }

  function clearAllFilters() {
    setSearch("");
    setFilters({});
  }

  function requestDelete(item: Record<string, unknown>) {
    if (!selectedEntity?.capability.delete) return;
    const itemId = String(item[selectedEntity.primaryKey] ?? "");
    if (!itemId) return;
    setPendingDeleteItem(item);
  }

  async function confirmDelete() {
    if (!selectedEntity?.capability.delete || !pendingDeleteItem) return;
    const itemId = String(
      pendingDeleteItem[selectedEntity.primaryKey] ?? ""
    );
    if (!itemId) {
      setPendingDeleteItem(null);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/entities/${selectedEntity.key}/${itemId}`,
        {
          method: "DELETE",
        }
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        // Foreign-key violations bubble up from Postgres with a long, technical
        // message. Surface a user-friendly hint while keeping the underlying
        // detail in the toast description.
        const fallback = `${selectedEntity.singularLabel} could not be deleted`;
        const rawMessage = payload.error || fallback;
        const isForeignKey = /foreign key|violates|referenced|constraint/i.test(
          rawMessage
        );
        if (isForeignKey) {
          toast.error(`${fallback} because it has linked records.`, {
            description:
              "Remove or reassign related items (events, prayer times, donations, etc.) and try again.",
          });
        } else {
          toast.error(rawMessage);
        }
        return;
      }

      toast.success(`${selectedEntity.singularLabel} deleted`);
      // Optimistically drop the row so the table updates instantly even before
      // the background refetch completes.
      setEntityData((current) => {
        if (!current) return current;
        const filteredItems = current.items.filter(
          (existing) => String(existing[selectedEntity.primaryKey] ?? "") !== itemId
        );
        return {
          ...current,
          items: filteredItems,
          totalCount: Math.max(0, (current.totalCount ?? filteredItems.length) - 1),
        };
      });
      startTransition(() => {
        refreshMetadata();
        setRefreshTick((current) => current + 1);
      });
      setPendingDeleteItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (!selectedEntity) return;
    const entity = selectedEntity;

    const payload: Record<string, unknown> = {};
    for (const field of entity.formFields) {
      if (field.readOnly) continue;
      payload[field.key] = formValues[field.key];
    }

    setSaving(true);
    try {
      const isUpdate = Boolean(editingItemId);
      const itemId = editingItemId ?? entity.singletonId ?? "app";
      const response = await fetch(
        isUpdate
          ? `/api/admin/entities/${entity.key}/${itemId}`
          : `/api/admin/entities/${entity.key}`,
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = (await response.json().catch(() => ({}))) as
        | AdminItemResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          ("error" in result ? result.error : undefined) || "Save failed"
        );
      }

      toast.success(
        `${entity.singularLabel} ${isUpdate ? "updated" : "created"}`
      );
      setDialogOpen(false);
      startTransition(() => {
        refreshMetadata();
        setRefreshTick((current) => current + 1);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: AdminFieldConfig) {
    const value = formValues[field.key];
    const disabled = Boolean(field.readOnly);
    const selectValue =
      typeof value === "string" && value.length > 0 ? value : EMPTY_SELECT_VALUE;
    const options = getFieldOptions(field, activeLookups);

    if (field.type === "textarea" || field.type === "json") {
      return (
        <Textarea
          id={field.key}
          value={typeof value === "string" ? value : ""}
          rows={field.type === "json" ? 10 : 4}
          onChange={(event) => updateFormValue(field.key, event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className="min-h-[138px] rounded-2xl border border-border/45 bg-background px-4 py-3.5 text-[0.95rem] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all placeholder:text-muted-foreground/60 hover:border-primary/35 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/70"
        />
      );
    }

    if (field.type === "boolean") {
      return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/45 bg-background px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{field.label}</p>
            <p className="text-xs text-muted-foreground">Turn this setting on or off</p>
          </div>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateFormValue(field.key, checked)}
            disabled={disabled}
          />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <Select
          value={selectValue}
          onValueChange={(nextValue) =>
            updateFormValue(
              field.key,
              nextValue === EMPTY_SELECT_VALUE ? "" : nextValue
            )
          }
          disabled={disabled}
        >
          <SelectTrigger className="h-12 rounded-2xl border border-border/45 bg-background px-4 text-[0.95rem] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all hover:border-primary/35 focus:ring-4 focus:ring-primary/15 data-[state=open]:border-primary/60">
            <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-2xl">
            <SelectItem value={EMPTY_SELECT_VALUE}>Not set</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    const type =
      field.type === "number"
        ? "number"
        : field.type === "email"
          ? "email"
          : field.type === "tel"
            ? "tel"
            : field.type === "date"
              ? "date"
              : field.type === "datetime"
                ? "datetime-local"
                : "text";

    return (
      <Input
        id={field.key}
        type={type}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          updateFormValue(field.key, event.target.value)
        }
        placeholder={field.placeholder}
        disabled={disabled}
        className="h-12 rounded-2xl border border-border/45 bg-background px-4 text-[0.95rem] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all placeholder:text-muted-foreground/60 hover:border-primary/35 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15"
      />
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3.5 w-3.5" />
              Live Sync
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Registry CRUD
            </Badge>
            {realtimeIssue ? (
              <Badge variant="outline">Manual Refresh Fallback</Badge>
            ) : null}
            {metadata?.settingsWritable ? (
              <Badge variant="secondary">Settings Ready</Badge>
            ) : (
              <Badge variant="destructive">Migration Required</Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              startTransition(() => {
                refreshMetadata();
                setRefreshTick((current) => current + 1);
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canOpenPrimaryEditor && (
            <Button onClick={openPrimaryDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {selectedEntity?.singleton
                ? `Edit ${selectedEntity.singularLabel}`
                : `Add ${selectedEntity?.singularLabel ?? "Record"}`}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visible Entities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingMetadata ? "..." : availableEntities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Registry-backed modules available for this view
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Selected Records</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingEntity ? "..." : entityData?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Filtered rows for the active entity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enabled Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledActionCount}</div>
            <p className="text-xs text-muted-foreground">
              Current role permissions for the active entity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingActivity ? "..." : activity.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {activityUnavailable
                ? "Activity is temporarily unavailable; CRUD remains active."
                : "Latest realtime mutations for this entity"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Managed Entities
          </CardTitle>
          <CardDescription>
            The registry below drives the shared CRUD layer, policy checks, and
            module visibility across the admin experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingMetadata ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading entities...
            </div>
          ) : metadataError ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {metadataError}
            </div>
          ) : availableEntities.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No entities are available for your role.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {availableEntities.map((entity) => (
                <button
                  key={entity.key}
                  type="button"
                  onClick={() => {
                    setSelectedEntityKey(entity.key);
                  }}
                  className={cn(
                    "group rounded-xl border px-4 py-3 text-left transition-all duration-300",
                    selectedEntity?.key === entity.key
                      ? "border-primary bg-gradient-to-br from-primary/8 via-primary/4 to-accent/4 shadow-elevation-md"
                      : "border-border/40 hover:border-primary/30 hover:bg-muted/50 hover:shadow-elevation-sm"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all",
                      selectedEntity?.key === entity.key
                        ? "bg-primary/15 border-primary/20 text-primary shadow-elevation-sm"
                        : "bg-primary/10 border-primary/15 text-primary/70 group-hover:bg-primary/15 group-hover:border-primary/20"
                    )}>
                      <Database className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{entity.label}</span>
                        {typeof entity.count === "number" && (
                          <Badge variant="secondary" className="shrink-0">{entity.count}</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {entity.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEntity && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle>{selectedEntity.label}</CardTitle>
                <CardDescription>{selectedEntity.description}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={selectedEntity.capability.read ? "secondary" : "outline"}>
                  Read {selectedEntity.capability.read ? "On" : "Off"}
                </Badge>
                <Badge
                  variant={selectedEntity.capability.create ? "secondary" : "outline"}
                >
                  Create {selectedEntity.capability.create ? "On" : "Off"}
                </Badge>
                <Badge
                  variant={selectedEntity.capability.update ? "secondary" : "outline"}
                >
                  Update {selectedEntity.capability.update ? "On" : "Off"}
                </Badge>
                <Badge
                  variant={selectedEntity.capability.delete ? "secondary" : "outline"}
                >
                  Delete {selectedEntity.capability.delete ? "On" : "Off"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedEntity.singleton &&
                (canSearchSelectedEntity || filterFields.length > 0) && (
                <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {canSearchSelectedEntity ? (
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={selectedEntity.searchPlaceholder}
                        className="lg:max-w-md"
                      />
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {filterFields.map((field) => {
                        const options = getFieldOptions(field, activeLookups);
                        const filterValue = filters[field.key] ?? "";

                        if (field.type === "boolean") {
                          return (
                            <Select
                              key={field.key}
                              value={filterValue || ALL_FILTER_VALUE}
                              onValueChange={(value) =>
                                updateFilterValue(
                                  field.key,
                                  value === ALL_FILTER_VALUE ? "" : value
                                )
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={field.label} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ALL_FILTER_VALUE}>
                                  All {field.label}
                                </SelectItem>
                                <SelectItem value="true">Enabled</SelectItem>
                                <SelectItem value="false">Disabled</SelectItem>
                              </SelectContent>
                            </Select>
                          );
                        }

                        if (!options.length) {
                          return null;
                        }

                        return (
                          <Select
                            key={field.key}
                            value={filterValue || ALL_FILTER_VALUE}
                            onValueChange={(value) =>
                              updateFilterValue(
                                field.key,
                                value === ALL_FILTER_VALUE ? "" : value
                              )
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={field.label} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ALL_FILTER_VALUE}>
                                All {field.label}
                              </SelectItem>
                              {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      })}
                      {(search || activeFilterCount > 0) && (
                        <Button variant="ghost" onClick={clearAllFilters}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Realtime events refresh the list automatically. Filters are
                    applied through the generic admin API.
                  </p>
                </div>
              )}

              {loadingEntity ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading {selectedEntity.label.toLowerCase()}...
                </div>
              ) : !entityData || entityData.items.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No {selectedEntity.label.toLowerCase()} found.
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectedEntity.listFields.map((fieldKey) => {
                          const field = selectedEntity.formFields.find(
                            (entry) => entry.key === fieldKey
                          );
                          return (
                            <TableHead key={fieldKey}>
                              {field?.label ?? fieldKey}
                            </TableHead>
                          );
                        })}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entityData.items.map((item) => (
                        <TableRow
                          key={String(
                            item[selectedEntity.primaryKey] ??
                              selectedEntity.singletonId ??
                              selectedEntity.key
                          )}
                        >
                          {selectedEntity.listFields.map((fieldKey) => {
                            const field = selectedEntity.formFields.find(
                              (entry) => entry.key === fieldKey
                            );
                            return (
                              <TableCell key={fieldKey}>
                                {formatCellValue(field, item[fieldKey], activeLookups)}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {selectedEntity.capability.update && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {selectedEntity.capability.delete &&
                                !selectedEntity.singleton && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Delete ${selectedEntity.singularLabel.toLowerCase()}`}
                                    onClick={() => requestDelete(item)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Recent Entity Activity</CardTitle>
                {activityUnavailable ? (
                  <Badge variant="outline">Activity Feed Unavailable</Badge>
                ) : null}
              </div>
              <CardDescription>
                The latest admin mutations for {selectedEntity.label.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingActivity ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading activity...
                </div>
              ) : activity.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No recent activity for this entity yet.
                </div>
              ) : (
                activity.map((item) => (
                  <div key={item.eventId} className="rounded-xl border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{formatActivityLabel(item)}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEntity.singularLabel} ID: {item.entityId}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(item.occurredAt).toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92vh] w-[min(96vw,980px)] flex-col gap-0 overflow-hidden rounded-[30px] border border-border/40 bg-background p-0 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="relative border-b border-border/20 bg-[linear-gradient(165deg,hsl(var(--background))_35%,hsl(var(--muted)/0.3)_100%)] px-7 pb-6 pt-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10" />
            <DialogHeader className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                      {editingItemId ? <Pencil className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                    </span>
                    {editingItemId ? "Edit" : "Create"} {selectedEntity?.singularLabel}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-[0.95rem] leading-6 text-muted-foreground">
                    {selectedEntity?.description}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium">
                    Admin Form
                  </Badge>
                  <Badge className="rounded-full px-3 py-1 text-xs font-medium">
                    {selectedEntity?.formFields.length ?? 0} fields
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-6 [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-border/70 [&::-webkit-scrollbar-thumb]:bg-clip-padding hover:[&::-webkit-scrollbar-thumb]:bg-border">
            <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-xs text-primary/90">
              Fill in the key details first. Optional fields can be completed later from the edit screen.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {selectedEntity?.formFields.map((field) => (
                <div
                  key={field.key}
                  className="group space-y-2.5 rounded-2xl border border-border/45 bg-muted/[0.12] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/[0.18] hover:shadow-[0_10px_24px_rgba(0,0,0,0.07)]"
                >
                  <Label
                    htmlFor={field.key}
                    className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm ring-1 ring-border/50">
                        {getFieldIcon(field)}
                      </span>
                      <span>{field.label}</span>
                    </span>
                    {field.required ? <span className="text-[11px] font-medium text-primary">Required</span> : null}
                  </Label>
                  <div>{renderField(field)}</div>
                  {field.description && (
                    <p className="text-xs leading-5 text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/20 bg-background/95 px-7 py-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="h-11 rounded-full border-border/60 bg-background px-6"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-11 rounded-full px-6 shadow-[0_10px_24px_hsl(var(--primary)/0.35)]">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingItemId ? "Save Changes" : "Create Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDeleteItem !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setPendingDeleteItem(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this {selectedEntity?.singularLabel.toLowerCase() ?? "record"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently
              removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
