import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-user-detail',
  standalone:true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail implements OnInit{
  user: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: User
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.isLoading = false;
      }
    });
  }

  exportToPDF(): void {
    if (!this.user) return;

    const doc = new jsPDF();
    doc.text('User Details', 14, 10);

    const userData = [
      ['ID', this.user.id],
      ['Name', `${this.user.firstName} ${this.user.lastName}`],
      ['Age', this.user.age],
      ['Gender', this.user.gender],
      ['Email', this.user.email],
      ['Phone', this.user.phone],
      ['Address', this.user.address.address],
      ['City', this.user.address?.city],
      ['State', this.user.address.state],
      ['Country', this.user.address.country],
  ['Blood Group', this.user.bloodGroup],
  ['Birth Date',this.user.birthDate],
  ['Department', this.user.company.department ],
  ['Title', this.user.company.title],
  ['Role', this.user.role ]
    ];

    autoTable(doc, {
      head: [['Field', 'Value']],
      body: userData,
      startY: 20,
    });

    doc.save(`user-${this.user.id}.pdf`);
  }

  exportToExcel(): void {
    if (!this.user) return;

    const data = [
      {
        ID: this.user.id,
        Name: `${this.user.firstName} ${this.user.lastName}`,
        Age: this.user.age,
        Gender: this.user.gender,
        Email: this.user.email,
        Phone: this.user.phone,
        Address: this.user.address.address,
      City: this.user.address?.city,
      State: this.user.address.state,
      Country: this.user.address.country,
  BloodGroup: this.user.bloodGroup,
  BirthDate: this.user.birthDate,
  Department: this.user.company.department ,
  Title: this.user.company.title,
  Role: this.user.role
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { User: worksheet }, SheetNames: ['User'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, `user-${this.user.id}.xlsx`);
  }

}
