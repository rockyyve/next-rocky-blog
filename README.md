# A statically generated blog example using Next.js, Markdown, and TypeScript

This is the existing [blog-starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) plus TypeScript.

This example showcases Next.js's [Static Generation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) feature using Markdown files as the data source.

The blog posts are stored in `/_posts` as Markdown files with front matter support. Adding a new Markdown file in there will create a new blog post.

To create the blog posts we use [`remark`](https://github.com/remarkjs/remark) and [`remark-html`](https://github.com/remarkjs/remark-html) to convert the Markdown files into an HTML string, and then send it down as a prop to the page. The metadata of every post is handled by [`gray-matter`](https://github.com/jonschlinkert/gray-matter) and also sent in props to the page.

## Features

- ✅ Static blog generation with Next.js
- ✅ SimpleMDE markdown editor for creating posts
- ✅ Cover image upload with Supabase Storage
- ✅ User authentication with Supabase Auth
- ✅ Responsive design with Tailwind CSS
- ✅ Dark mode support

## Setup Instructions

### 1. Supabase Configuration

#### Database Tables
Create the following table in your Supabase database:

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preview BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts table
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);
```

#### Storage Configuration
1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named `blog-images`
4. Set the bucket to **Public** (for cover images)
5. Configure the following bucket policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access for blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2. Environment Variables
Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Authentication Setup
Configure GitHub OAuth in your Supabase dashboard:
1. Go to Authentication > Providers
2. Enable GitHub provider
3. Add your GitHub OAuth app credentials

## Demo

[https://next-blog-starter.vercel.app/](https://next-blog-starter.vercel.app/)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example blog-starter blog-starter-app
```

```bash
yarn create next-app --example blog-starter blog-starter-app
```

```bash
pnpm create next-app --example blog-starter blog-starter-app
```

Your blog should be up and running on [http://localhost:3000](http://localhost:3000)! If it doesn't work, post on [GitHub discussions](https://github.com/vercel/next.js/discussions).

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## Usage

### Creating a New Blog Post
1. Navigate to `/create` (requires authentication)
2. Fill in the post title
3. Optionally add an excerpt
4. Upload a cover image (optional, supports JPG/PNG, max 5MB)
5. Write your content using the SimpleMDE markdown editor
6. Click "Create Post" to publish

### Features
- **Rich Markdown Editor**: SimpleMDE provides a user-friendly markdown editing experience
- **Image Upload**: Direct upload to Supabase Storage with preview
- **Auto-generated Excerpts**: If no excerpt is provided, one is automatically generated
- **SEO-friendly URLs**: Post titles are automatically converted to URL-safe slugs
- **Responsive Design**: Works seamlessly on desktop and mobile devices

# Notes

`blog-starter` uses [Tailwind CSS](https://tailwindcss.com) [(v3.0)](https://tailwindcss.com/blog/tailwindcss-v3).
