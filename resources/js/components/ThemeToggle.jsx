import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const stored = localStorage.getItem('appearance') || 'light';
        setTheme(stored);
        applyTheme(stored);
    }, []);

    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';

        setTheme(newTheme);
        localStorage.setItem('appearance', newTheme);
        applyTheme(newTheme);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="h-10 w-10 cursor-pointer rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{theme === 'light' ? 'Dark' : 'Light'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
