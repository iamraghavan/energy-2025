
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getSchools, createSchool, updateSchool, deleteSchool } from '@/services/school-service';
import type { School } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

const schoolSchema = z.object({
  name: z.string().min(3, { message: 'School name must be at least 3 characters long.' }),
  location: z.string().min(3, { message: 'Location is required.' }),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export function SchoolsTable() {
  const [data, setData] = React.useState<School[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);

  const { toast } = useToast();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { name: '', location: '' },
  });

  const fetchSchools = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const schools = await getSchools();
      setData(schools);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch schools',
        description: 'Could not load school data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleEditClick = (school: School) => {
    setSelectedSchool(school);
    form.reset({ name: school.name, location: school.location });
    setIsFormModalOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedSchool(null);
    form.reset({ name: '', location: '' });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteAlertOpen(true);
  };

  const onFormSubmit = async (values: SchoolFormValues) => {
    const payload = {
        name: values.name,
        address: values.location, // Map UI 'location' to API 'address'
    };
    try {
      if (selectedSchool) {
        // Update existing school
        await updateSchool(selectedSchool._id, payload);
        toast({ title: 'School Updated', description: `${values.name} has been successfully updated.` });
      } else {
        // Create new school
        await createSchool(payload);
        toast({ title: 'School Created', description: `${values.name} has been successfully created.` });
      }
      setIsFormModalOpen(false);
      fetchSchools(); // Refresh data
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Operation Failed`,
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedSchool) return;
    try {
        await deleteSchool(selectedSchool._id);
        toast({ title: 'School Deleted', description: `${selectedSchool.name} has been successfully deleted.` });
        setIsDeleteAlertOpen(false);
        fetchSchools(); // Refresh data
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'Could not delete the school.',
        });
    }
  }

  const columns: ColumnDef<School>[] = [
    {
      accessorKey: 'schoolId',
      header: 'School ID',
      cell: ({ row }) => <div>{row.getValue('schoolId')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'School Name',
      cell: ({ row }) => <div className="capitalize font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('location')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: () => <div className="text-right">Created At</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        const formatted = date.toLocaleDateString();
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const school = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditClick(school)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(school)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter schools by name..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
              <DialogTrigger asChild>
                  <Button onClick={handleAddClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New School
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                  <DialogTitle>{selectedSchool ? 'Edit School' : 'Create a New School'}</DialogTitle>
                  <DialogDescription>
                      {selectedSchool ? "Update the school's details below." : 'Fill in the details to add a new school to the system.'}
                  </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>School Name</FormLabel>
                                      <FormControl>
                                          <Input placeholder="e.g., Greenwood Academy" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Location</FormLabel>
                                      <FormControl>
                                          <Input
                                              placeholder="Enter the location"
                                              {...field}
                                          />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the district, city, or general location name.
                                      </FormDescription>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <DialogFooter>
                              <Button type="submit" disabled={form.formState.isSubmitting}>
                                  {form.formState.isSubmitting ? 'Saving...' : 'Save School'}
                              </Button>
                          </DialogFooter>
                      </form>
                  </Form>
              </DialogContent>
          </Dialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the school
                        <span className="font-bold"> {selectedSchool?.name} </span>
                        and remove its data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
