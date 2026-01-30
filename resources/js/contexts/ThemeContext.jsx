import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppearance } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        if (appearance === 'light') {
            updateAppearance('dark');
        } else if (appearance === 'dark') {
            updateAppearance('system');
        } else {
            updateAppearance('light');
        }
    };

    const getIcon = () => {
        if (appearance === 'light') return <Sun className="h-6 w-6" />;
        if (appearance === 'dark') return <Moon className="h-6 w-6" />;

        const isDarkSystem = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDarkSystem ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />;
    };

    const getTooltip = () => {
        const modes = { light: 'Light', dark: 'Dark', system: 'System' };
        return `${modes[appearance]} mode`;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 transition-transform hover:scale-105">
                        {getIcon()}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{getTooltip()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
