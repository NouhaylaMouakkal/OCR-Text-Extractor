import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  emailText: string = ''; 
  prediction: any;
  public extractedText: string = ''; 
  public imageUrl?: string; // To hold the image URL
  public uploadedImage?: string; // To hold the uploaded image's base64 or URL
  public errorMessage: string = ''; // To hold the error message

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onUploadClick() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });
    fileInput.click();
  }

  // New method to handle file selection from input
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    // Check if the uploaded file is an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      this.errorMessage = 'Please upload a valid image file (jpg, png, gif, webp).';
      this.uploadedImage = undefined; // Clear previous image
      this.extractedText = ''; // Clear extracted text
      return; // Exit the function
    } else {
      this.errorMessage = ''; // Clear error message if the file is valid
    }

    const formData = new FormData();
    formData.append('file', file);
    this.uploadImage(formData);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedImage = e.target.result; // Set the uploaded image base64
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }

  uploadImage(formData: FormData) {
    this.http.post<any>('http://localhost:5000/upload', formData).subscribe(
      (response) => {
        console.log('Extracted text:', response.extracted_text);
        this.imageUrl = 'data:image/png;base64,' + response.image_base64;
        this.extractedText = response.extracted_text; 
      },
      (error) => {
        console.error('Upload failed:', error);
      }
    );
  }

  copyText(): void {
    navigator.clipboard.writeText(this.extractedText).then(() => {
      console.log('Text copied to clipboard');
      // Optionally, you can show a "Copied!" message here
    });
  }
}
