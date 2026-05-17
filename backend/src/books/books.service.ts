import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  private books: Book[] = [];

  findAll(): Book[] {
    return this.books;
  }

  findOne(id: string): Book {
    const book = this.books.find((b) => b.id === id);
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  create(dto: CreateBookDto): Book {
    const book: Book = {
      id: uuidv4(),
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn ?? '',
      publishedYear: dto.publishedYear,
      genre: dto.genre ?? 'general',
      createdAt: new Date(),
    };
    this.books.push(book);
    return book;
  }

  update(id: string, dto: UpdateBookDto): Book {
    const book = this.findOne(id);
    Object.assign(book, dto);
    return book;
  }

  remove(id: string): void {
    const idx = this.books.findIndex((b) => b.id === id);
    if (idx === -1) throw new NotFoundException(`Book ${id} not found`);
    this.books.splice(idx, 1);
  }
}
