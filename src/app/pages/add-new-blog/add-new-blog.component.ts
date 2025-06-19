import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css';
import { BlogService } from '../../services/dashBlog/blog.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-new-blog',
  standalone: true,
  imports: [QuillModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './add-new-blog.component.html',
  styleUrl: './add-new-blog.component.scss'
})
export class AddNewBlogComponent implements OnInit {
  blogForm: FormGroup;
  modules: any;
  @ViewChild('mainImage') mainImageInput!: ElementRef;
  @ViewChild('galleryImage') galleryImageInput!: ElementRef;

  mainImageUrl: string | null = null;
  availablePlaces: string[] = ['Paris', 'London', 'New York', 'Tokyo'];
  availableCategories = ['Technology', 'Lifestyle', 'Travel', 'Food'];
  availableTags = ['Travel', 'Tech', 'Lifestyle', 'Food', 'Health'];
  isEditMode = false;
  blogId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private blogService: BlogService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.blogForm = this.fb.group({
      title: [''],
      categories: this.fb.array([]),
      places: this.fb.array([]),
      newPlace: new FormControl(''),
      newCategory: new FormControl(''),
      tags: this.fb.array([]),
      newTag: new FormControl(''),
      mainImage: [null],
      headerImages: this.fb.array([]),
      description: ['']
    });

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    };
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.blogId = +params['id'];
        this.loadBlogData(this.blogId);
      }
    });
  }

  loadBlogData(id: number): void {
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.populateForm(blog);
      },
      error: (error) => {
        this.toastr.error('Failed to load blog data');
        console.error('Error loading blog:', error);
      }
    });
  }

  populateForm(blog: any): void {
    // Clear all form arrays first
    this.clearFormArrays();

    // Set basic fields
    this.blogForm.patchValue({
      title: blog.title,
      description: blog.description,
      mainImage: blog.mainImage
    });

    this.mainImageUrl = blog.mainImage;
    console.log('Blog data received:', blog);


    
    if (blog.category) {
      this.categories.push(new FormControl(blog.category));
    }

 

    // Set places
    if (blog.places && blog.places.length > 0) {
      blog.places.forEach((place: string) => {
        this.places.push(new FormControl(place));
      });
    }

    // Set tags
    if (blog.tags && blog.tags.length > 0) {
      blog.tags.forEach((tag: string) => {
        this.tags.push(new FormControl(tag));
      });
    }

    // Set header images
    if (blog.headerImages && blog.headerImages.length > 0) {
      blog.headerImages.forEach((image: string) => {
        if (image && image.trim()) {
          this.headerImages.push(new FormControl(image));
        }
      });
    }
  }

  clearFormArrays(): void {
    this.categories.clear();
    this.places.clear();
    this.tags.clear();
    this.headerImages.clear();
  }

  get places(): FormArray {
    return this.blogForm.get('places') as FormArray;
  }

  get tags(): FormArray {
    return this.blogForm.get('tags') as FormArray;
  }

  get categories(): FormArray {
    return this.blogForm.get('categories') as FormArray;
  }

  get headerImages(): FormArray {
    return this.blogForm.get('headerImages') as FormArray;
  }

  addPlace() {
    const newPlaceValue = this.blogForm.get('newPlace')?.value;
    if (newPlaceValue && newPlaceValue.trim()) {
      this.places.push(new FormControl(newPlaceValue.trim()));
      this.blogForm.get('newPlace')?.setValue('');
    }
  }

  trackByFn(index: number): number {
    return index;
  }

  removePlace(index: number) {
    this.places.removeAt(index);
  }

  addTag() {
    const newTagValue = this.blogForm.get('newTag')?.value;
    if (newTagValue && newTagValue.trim()) {
      this.tags.push(new FormControl(newTagValue.trim()));
      this.blogForm.get('newTag')?.setValue('');
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  addCategory() {
    const newCategoryValue = this.blogForm.get('newCategory')?.value;
    if (newCategoryValue && newCategoryValue.trim()) {
      this.categories.push(new FormControl(newCategoryValue.trim()));
      this.blogForm.get('newCategory')?.setValue('');
    }
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }

  triggerFileInput(imageType: string) {
    if (imageType === 'mainImage') {
      this.mainImageInput.nativeElement.click();
    } else if (imageType === 'galleryImage') {
      this.galleryImageInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event, imageType: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (imageType === 'galleryImage') {
      this.uploadGalleryImages(input.files);
    } else {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (imageType === 'mainImage') {
          this.mainImageUrl = reader.result as string;
          this.blogForm.patchValue({ mainImage: this.mainImageUrl });
        }
        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    }
  }

    uploadGalleryImages(files: FileList) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.headerImages.push(new FormControl(reader.result as string));
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }

  removeImage(index: number) {
    this.headerImages.removeAt(index);
  }

  stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  submitBlog() {
    if (this.blogForm.valid) {
      const formData = this.blogForm.value;

      const requestData = {
        title: formData.title,
        description: this.stripHtml(formData.description),
        mainImage: formData.mainImage || "",
        headerImages: formData.headerImages.length > 0 ? formData.headerImages.join(",") : "",
        categoryName: formData.categories.length > 0 ? formData.categories[0] : "",
        places: formData.places || [],
        tags: formData.tags || []
      };

      if (this.isEditMode && this.blogId) {
        this.updateBlog(requestData);
      } else {
        this.createBlog(requestData);
      }
    } else {
      this.toastr.warning('Please fill all required fields.', 'Warning');
    }
  }

  createBlog(blogData: any) {
    this.blogService.addBlog(blogData).subscribe({
      next: (response) => {
        this.toastr.success('Blog added successfully!', 'Success');
        this.resetForm();
        this.router.navigate(['/dashboard/blogs']);
      },
      error: (error) => {
        console.error('Error adding blog:', error);
        this.toastr.error('Failed to add blog. Please try again.', 'Error');
      }
    });
  }

  updateBlog(blogData: any) {
    if (!this.blogId) return;

    this.blogService.updateBlog(this.blogId, blogData).subscribe({
      next: (response) => {
        this.toastr.success('Blog updated successfully!', 'Success');
        this.router.navigate(['/dashboard/blogs']);
      },
      error: (error) => {
        console.error('Error updating blog:', error);
        this.toastr.error('Failed to update blog. Please try again.', 'Error');
      }
    });
  }

  resetForm() {
    this.blogForm.reset();
    this.clearFormArrays();
    this.blogForm.patchValue({ mainImage: null });
    this.mainImageUrl = null;
    this.blogForm.markAsPristine();
    this.blogForm.markAsUntouched();
  }

  removeMainImage() {
    this.mainImageUrl = null;
    // إذا كنت تستخدم FormControl للـ mainImage:
    // this.blogForm.get('mainImage').setValue(null);
  }
}