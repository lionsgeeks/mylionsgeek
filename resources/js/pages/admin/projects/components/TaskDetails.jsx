import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TaskDetails = ({ task }) => {
    return (
        <Card className="bg-background/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{task.description || 'No description provided'}</p>
            </CardContent>
        </Card>
    );
};

export default TaskDetails;
