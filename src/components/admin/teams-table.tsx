
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Check, ChevronsUpDown } from 'lucide-react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
import { useToast } from '@/hooks/use-toast';
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/services/team-service';
import { getSchools } from '@/services/school-service';
import { getSports } from '@/services/sport-service';
import type { Team, School, SportAPI, TeamPayload } from '@/lib/types';
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


const teamSchema = z.object({
  name: z.string().min(3, { message: 'Team name must be at least 3 characters long.' }),
  sportId: z.string({ required_error: 'Please select a sport.' }),
  schoolId: z.string({ required_error: 'Please select a school.' }),
  gender: z.enum(['M', 'F'], { required_error: 'Please select a gender.' }),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export function TeamsTable() {
  const [data, setData] = React.useState<Team[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [sports, setSports] = React.useState<SportAPI[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  const { toast } = useToast();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
  });

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamsData, schoolsData, sportsData] = await Promise.all([
        getTeams(),
        getSchools(),
        getSports(),
      ]);
      setData(teamsData);
      setSchools(schoolsData);
      setSports(sportsData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch data',
        description: 'Could not load teams, schools, or sports data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    form.reset({ 
        name: team.name,
        schoolId: team.school._id,
        sportId: team.sport._id,
        gender: team.gender,
     });
    setIsFormModalOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedTeam(null);
    form.reset({ name: '', schoolId: undefined, sportId: undefined, gender: undefined });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteAlertOpen(true);
  };

  const onFormSubmit = async (values: TeamFormValues) => {
    const payload: TeamPayload = {
        name: values.name,
        sportId: sports.find(s => s._id === values.sportId)?.sportId || '',
        schoolId: schools.find(s => s._id === values.schoolId)?.schoolId || '',
        gender: values.gender,
    };
    
    if (!payload.sportId || !payload.schoolId) {
        toast({
            variant: 'destructive',
            title: 'Invalid Selection',
            description: 'Could not find the selected school or sport.',
        });
        return;
    }

    try {
      if (selectedTeam) {
        await updateTeam(selectedTeam._id, payload);
        toast({ title: 'Team Updated', description: `${values.name} has been successfully updated.` });
      } else {
        await createTeam(payload);
        toast({ title: 'Team Created', description: `${values.name} has been successfully created.` });
      }
      setIsFormModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Operation Failed`,
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedTeam) return;
    try {
        await deleteTeam(selectedTeam._id);
        toast({ title: 'Team Deleted', description: `${selectedTeam.name} has been successfully deleted.` });
        setIsDeleteAlertOpen(false);
        fetchData(); // Refresh data
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'Could not delete the team.',
        });
    }
  }

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: 'teamId',
      header: 'Team ID',
    },
    {
      accessorKey: 'name',
      header: 'Team Name',
      cell: ({ row }) => <div className="capitalize font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'school.name',
        header: 'School',
    },
    {
        accessorKey: 'sport.name',
        header: 'Sport',
    },
    {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => <div>{row.getValue('gender') === 'M' ? 'Male' : 'Female'}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const team = row.original;
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
              <DropdownMenuItem onClick={() => handleEditClick(team)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(team)}
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
    state: {
      sorting,
      columnFilters,
    },
  });

  const schoolOptions = schools.map(school => ({ value: school._id, label: school.name }));
  const sportOptions = sports.map(sport => ({ value: sport._id, label: sport.name }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter teams by name..."
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
                    Create New Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create a New Team'}</DialogTitle>
                <DialogDescription>
                    {selectedTeam ? "Update the team's details below." : 'Fill in the details to add a new team.'}
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Lions" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="schoolId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>School</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value
                                            ? schoolOptions.find(
                                                (option) => option.value === field.value
                                            )?.label
                                            : "Select school"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search school..." />
                                        <CommandList>
                                            <CommandEmpty>No school found.</CommandEmpty>
                                            <CommandGroup>
                                                {schoolOptions.map((option) => (
                                                <CommandItem
                                                    value={option.label}
                                                    key={option.value}
                                                    onSelect={() => {
                                                        form.setValue("schoolId", option.value)
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        option.value === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                    />
                                                    {option.label}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sportId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Sport</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "w-full justify-between",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value
                                            ? sportOptions.find(
                                                (option) => option.value === field.value
                                            )?.label
                                            : "Select sport"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search sport..." />
                                        <CommandList>
                                            <CommandEmpty>No sport found.</CommandEmpty>
                                            <CommandGroup>
                                                {sportOptions.map((option) => (
                                                <CommandItem
                                                    value={option.label}
                                                    key={option.value}
                                                    onSelect={() => {
                                                        form.setValue("sportId", option.value)
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        option.value === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                    )}
                                                    />
                                                    {option.label}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                           <FormField
                              control={form.control}
                              name="gender"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <ShadSelect onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value="M">Male</SelectItem>
                                          <SelectItem value="F">Female</SelectItem>
                                      </SelectContent>
                                  </ShadSelect>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Team'}
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
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading data...</TableCell></TableRow>
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
                  No teams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
                      This action cannot be undone. This will permanently delete the team
                      <span className="font-bold"> {selectedTeam?.name} </span>
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
    </div>
  );
}
