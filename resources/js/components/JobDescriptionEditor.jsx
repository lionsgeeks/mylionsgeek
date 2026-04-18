import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Gapcursor from '@tiptap/extension-gapcursor';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold as BoldIcon,
    Heading2,
    Heading3,
    Italic as ItalicIcon,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { useEffect } from 'react';

export default function JobDescriptionEditor({ id = 'job-description', label = 'Description', value, onChange, error }) {
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            Underline,
            Heading.configure({ levels: [2, 3] }),
            BulletList,
            OrderedList,
            ListItem,
            History,
            Gapcursor,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: 'Describe the role, responsibilities, and what you are looking for…',
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none min-h-[220px] px-3 py-2 outline-none',
                    'text-beta dark:text-light [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold',
                    'focus-visible:outline-none',
                ),
            },
        },
        onUpdate: ({ editor: ed }) => {
            onChange(ed.getHTML());
        },
    });

    useEffect(() => {
        if (!editor || editor.isDestroyed) {
            return;
        }
        const incoming = value || '';
        const current = editor.getHTML();
        if (incoming === current) {
            return;
        }
        editor.commands.setContent(incoming, { emitUpdate: false });
    }, [value, editor]);

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div
                id={id}
                className={cn(
                    'rounded-md border border-alpha/30 bg-white dark:border-light/15 dark:bg-dark_gray',
                    error && 'border-red-500 dark:border-red-500',
                )}
            >
                {editor ? (
                    <div className="flex flex-col gap-2 p-2">
                        <div className="flex flex-wrap gap-1 border-b border-alpha/15 pb-2 dark:border-light/10">
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('bold')}
                                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                                aria-label="Bold"
                            >
                                <BoldIcon className="h-4 w-4" />
                            </Toggle>
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('italic')}
                                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                                aria-label="Italic"
                            >
                                <ItalicIcon className="h-4 w-4" />
                            </Toggle>
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('underline')}
                                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                                aria-label="Underline"
                            >
                                <UnderlineIcon className="h-4 w-4" />
                            </Toggle>
                            <span className="mx-1 hidden h-6 w-px bg-alpha/20 sm:inline dark:bg-light/20" aria-hidden />
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('heading', { level: 2 })}
                                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                aria-label="Heading 2"
                            >
                                <Heading2 className="h-4 w-4" />
                            </Toggle>
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('heading', { level: 3 })}
                                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                aria-label="Heading 3"
                            >
                                <Heading3 className="h-4 w-4" />
                            </Toggle>
                            <span className="mx-1 hidden h-6 w-px bg-alpha/20 sm:inline dark:bg-light/20" aria-hidden />
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('bulletList')}
                                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                                aria-label="Bullet list"
                            >
                                <List className="h-4 w-4" />
                            </Toggle>
                            <Toggle
                                size="sm"
                                variant="outline"
                                pressed={editor.isActive('orderedList')}
                                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                                aria-label="Numbered list"
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Toggle>
                            <span className="mx-1 hidden h-6 w-px bg-alpha/20 sm:inline dark:bg-light/20" aria-hidden />
                            <Button
                                type="button"
                                size="sm"
                                variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'outline'}
                                className="h-8 px-2"
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                aria-label="Align left"
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'outline'}
                                className="h-8 px-2"
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                aria-label="Align center"
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'outline'}
                                className="h-8 px-2"
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                aria-label="Align right"
                            >
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <EditorContent editor={editor} className="max-h-[min(50vh,28rem)] overflow-y-auto" />
                    </div>
                ) : (
                    <div className="min-h-[220px] animate-pulse rounded-md bg-muted/40" aria-hidden />
                )}
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    );
}
