import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = true;

  searchTerm = '';
  sortBy = '';
  currentPage = 1;
  usersPerPage = 10;

  constructor(private userService: User, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data.users;
        this.filteredUsers = this.users;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
      }
    });
  }

  searchUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    this.sortUsers();
    this.currentPage = 1;
  }

  sortUsers(): void {
    if(this.sortBy ==='id'){
      this.filteredUsers.sort((a,b)=>
      a.id - b.id);
    } else if (this.sortBy === 'age') {
      this.filteredUsers.sort((a, b) => a.age - b.age);
    } else if (this.sortBy === 'department') {
      this.filteredUsers.sort((a, b) =>
        a.company?.department.localeCompare(b.company?.department)
      );
    } else if (this.sortBy === 'bloodGroup') {
      this.filteredUsers.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    } else if (this.sortBy === 'name') {
      this.filteredUsers.sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
    }
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.usersPerPage;
    return this.filteredUsers.slice(start, start + this.usersPerPage);
  }

  nextPage(): void {
    if (this.currentPage * this.usersPerPage < this.filteredUsers.length) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  viewDetails(id: number): void {
    this.router.navigate(['/user', id]);
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    doc.text('User List', 14, 15);

    const tableData = this.filteredUsers.map((u) => [
      u.id,
      `${u.firstName} ${u.lastName}`,
      u.age,
      u.company?.department,
      u.bloodGroup,
      u.email,
    ]);

    (autoTable as any)(doc, {
      head: [['ID', 'Name', 'Age', 'Department', 'Blood Group', 'Email']],
      body: tableData,
      startY: 20,
    });

    doc.save('user-list.pdf');
  }
}