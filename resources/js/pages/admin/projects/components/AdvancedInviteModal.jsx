import FlashMessage from '@/components/FlashMessage';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AtSign, Check, Mail, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AdvancedInviteModal = ({ isOpen, onClose, projectId, projectName, users = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);
    const [atPosition, setAtPosition] = useState(-1);
    const [flashMessage, setFlashMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);
    const suggestionRef = useRef(null);

    // Get flash messages from Inertia
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        emails: [],
        usernames: [],
        role: 'member',
        message: '',
        project_id: projectId || null,
    });

    // Update project_id when projectId prop changes
    useEffect(() => {
        if (projectId) {
            setData('project_id', projectId);
        }
    }, [projectId]);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if input is email
    const isEmail = (text) => emailRegex.test(text.trim());

    // Check if user exists by email
    const findUserByEmail = (email) => {
        return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    };

    // Check if user exists by username
    const findUserByUsername = (username) => {
        return users.find((user) => user.name.toLowerCase().includes(username.toLowerCase()));
    };

    // Get username suggestions
    const getUsernameSuggestions = (query) => {
        if (query.length < 2) return [];
        return users
            .filter(
                (user) =>
                    user.name.toLowerCase().includes(query.toLowerCase()) &&
                    !selectedItems.some((item) => item.type === 'username' && item.value === user.name),
            )
            .slice(0, 5);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        // Check for @username pattern
        const atIndex = value.lastIndexOf('@');
        if (atIndex !== -1) {
            const query = value.substring(atIndex + 1);
            setAtPosition(atIndex);

            if (query.length >= 1) {
                setShowUsernameSuggestions(true);
                setUsernameSuggestions(getUsernameSuggestions(query));
            } else {
                setShowUsernameSuggestions(false);
            }
        } else {
            setShowUsernameSuggestions(false);
            setAtPosition(-1);
        }

        // Check for email suggestions
        if (value.includes(',') || value.includes(' ')) {
            const parts = value.split(/[,\s]+/);
            const lastPart = parts[parts.length - 1];

            if (lastPart && isEmail(lastPart)) {
                const user = findUserByEmail(lastPart);
                if (user) {
                    setSuggestions([user]);
                    setShowSuggestions(true);
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    // Handle key down
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addCurrentInput();
        } else if (e.key === 'Backspace' && inputValue === '' && selectedItems.length > 0) {
            // Remove last selected item
            setSelectedItems((prev) => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setShowUsernameSuggestions(false);
        }
    };

    // Add current input as item
    const addCurrentInput = () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        // Check if it's an email
        if (isEmail(trimmedValue)) {
            const user = findUserByEmail(trimmedValue);
            const newItem = {
                id: `email-${Date.now()}`,
                type: 'email',
                value: trimmedValue,
                display: trimmedValue,
                user: user,
                exists: !!user,
            };
            setSelectedItems((prev) => [...prev, newItem]);
        } else if (trimmedValue.startsWith('@')) {
            // Handle @username
            const username = trimmedValue.substring(1);
            const user = findUserByUsername(username);
            const newItem = {
                id: `username-${Date.now()}`,
                type: 'username',
                value: username,
                display: `@${username}`,
                user: user,
                exists: !!user,
            };
            setSelectedItems((prev) => [...prev, newItem]);
        } else {
            // Treat as email if no @ at start
            const user = findUserByEmail(trimmedValue);
            const newItem = {
                id: `email-${Date.now()}`,
                type: 'email',
                value: trimmedValue,
                display: trimmedValue,
                user: user,
                exists: !!user,
            };
            setSelectedItems((prev) => [...prev, newItem]);
        }

        setInputValue('');
        setShowSuggestions(false);
        setShowUsernameSuggestions(false);
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        const newItem = {
            id: `${suggestion.type}-${Date.now()}`,
            type: suggestion.type,
            value: suggestion.value,
            display: suggestion.type === 'username' ? `@${suggestion.value}` : suggestion.value,
            user: suggestion.user,
            exists: true,
        };
        setSelectedItems((prev) => [...prev, newItem]);
        setInputValue('');
        setShowSuggestions(false);
        setShowUsernameSuggestions(false);
    };

    // Remove selected item
    const removeItem = (id) => {
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    };

    // Handle flash messages from Inertia
    useEffect(() => {
        if (flash?.success) {
            // Check if success message contains warning about log driver
            if (flash.success.includes('logged') || flash.success.includes('NOT sent')) {
                setFlashMessage({ message: flash.success, type: 'warning' });
                // Don't auto-close for warnings - user needs to read the message
            } else {
                setFlashMessage({ message: flash.success, type: 'success' });
                // Auto-close after success
                setTimeout(() => {
                    reset();
                    setSelectedItems([]);
                    setInputValue('');
                    setFlashMessage(null);
                    onClose();
                }, 3000);
            }
        } else if (flash?.warning) {
            setFlashMessage({ message: flash.warning, type: 'warning' });
            // Don't auto-close for warnings - user needs to read the message
        } else if (flash?.error) {
            setFlashMessage({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            setFlashMessage({
                message: 'Please add at least one email address or username to invite.',
                type: 'error',
            });
            return;
        }

        const emails = selectedItems.filter((item) => item.type === 'email').map((item) => item.value);
        const usernames = selectedItems.filter((item) => item.type === 'username').map((item) => item.value);

        // Validate emails
        const invalidEmails = emails.filter((email) => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
            setFlashMessage({
                message: `Invalid email addresses: ${invalidEmails.join(', ')}`,
                type: 'error',
            });
            return;
        }

        // Prepare the data to send - ensure all data is included
        const submissionData = {
            project_id: projectId,
            emails: emails,
            usernames: usernames,
            role: data.role || 'member',
            message: data.message || '',
        };

        //console.log('Submitting invitation:', submissionData);
        //console.log('Current form data:', data);

        setIsSubmitting(true);

        // Use router.post directly with the data to ensure it's sent correctly
        router.post('/admin/projects/invite', submissionData, {
            preserveScroll: true,
            onStart: () => {
                setIsSubmitting(true);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
            onSuccess: (page) => {
                setIsSubmitting(false);
                // Flash messages (success/warning/error) will be handled by useEffect
                // Only auto-close if it's a success (not warning)
                if (page.props.flash?.success && !page.props.flash?.warning) {
                    // Don't reset here, let the useEffect handle it
                } else if (!page.props.flash?.warning && !page.props.flash?.error) {
                    // Fallback success message
                    setFlashMessage({
                        message: `${emails.length + usernames.length} invitation(s) sent successfully!`,
                        type: 'success',
                    });
                    setTimeout(() => {
                        reset();
                        setSelectedItems([]);
                        setInputValue('');
                        setFlashMessage(null);
                        onClose();
                    }, 3000);
                }
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Invitation errors:', errors);
                const errorMessages = [];

                if (errors.project_id) {
                    const projectErrors = Array.isArray(errors.project_id) ? errors.project_id : [errors.project_id];
                    errorMessages.push(`Project: ${projectErrors.join(', ')}`);
                }

                if (errors.emails) {
                    const emailErrors = Array.isArray(errors.emails) ? errors.emails : [errors.emails];
                    errorMessages.push(`Emails: ${emailErrors.join(', ')}`);
                }

                if (errors.usernames) {
                    const usernameErrors = Array.isArray(errors.usernames) ? errors.usernames : [errors.usernames];
                    errorMessages.push(`Usernames: ${usernameErrors.join(', ')}`);
                }

                if (errors.role) {
                    const roleErrors = Array.isArray(errors.role) ? errors.role : [errors.role];
                    errorMessages.push(`Role: ${roleErrors.join(', ')}`);
                }

                if (errors.message) {
                    errorMessages.push(errors.message);
                }

                // Check for general error message
                if (Object.keys(errors).length > 0 && errorMessages.length === 0) {
                    errorMessages.push('Validation failed. Please check your input.');
                }

                if (errorMessages.length === 0) {
                    errorMessages.push('Failed to send invitations. Please try again.');
                }

                setFlashMessage({
                    message: errorMessages.join('. '),
                    type: 'error',
                });
            },
        });
    };

    // Handle close
    const handleClose = () => {
        reset();
        setSelectedItems([]);
        setInputValue('');
        setShowSuggestions(false);
        setShowUsernameSuggestions(false);
        onClose();
    };

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setShowUsernameSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-[var(--color-alpha)]" />
                        Invite to {projectName}
                    </DialogTitle>
                </DialogHeader>

                {/* Flash Messages */}
                {flashMessage && <FlashMessage message={flashMessage.message} type={flashMessage.type} onClose={() => setFlashMessage(null)} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invitees">Invite People</Label>
                        <div className="relative">
                            <div className="mt-3 rounded-md border border-input p-3 focus-within:border-[var(--color-alpha)] focus-within:ring-2 focus-within:ring-[var(--color-alpha)]">
                                <div className="flex flex-wrap gap-2">
                                    {selectedItems.map((item) => (
                                        <Badge
                                            key={item.id}
                                            variant={item.exists ? 'default' : 'secondary'}
                                            className={`flex items-center gap-1 px-2 py-1 ${
                                                item.exists
                                                    ? 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'border-yellow-200 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}
                                        >
                                            {item.type === 'username' && <AtSign className="h-3 w-3" />}
                                            {item.type === 'email' && <Mail className="h-3 w-3" />}
                                            {item.user && (
                                                // <Avatar className="h-4 w-4">
                                                //     <AvatarImage src={item.user.image ? `/storage/${item.user.image}` : null} />
                                                //     <AvatarFallback className="text-xs">
                                                //         {item.user.name.charAt(0).toUpperCase()}
                                                //     </AvatarFallback>
                                                // </Avatar>
                                                <Avatar
                                                    className="relative z-50 h-12 w-12 overflow-hidden"
                                                    image={item.user.image}
                                                    name={item.user.name}
                                                    lastActivity={item.user.last_online || null}
                                                    onlineCircleClass="hidden"
                                                />
                                            )}
                                            <span className="text-xs">{item.display}</span>
                                            {item.exists && <Check className="h-3 w-3" />}
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type email addresses or @usernames..."
                                    className="w-full bg-transparent py-3 text-sm outline-none"
                                />
                            </div>

                            {/* Email Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    ref={suggestionRef}
                                    className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                >
                                    {suggestions.map((user, index) => (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                handleSuggestionClick({
                                                    type: 'email',
                                                    value: user.email,
                                                    user: user,
                                                })
                                            }
                                            className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {/* <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image ? `/storage/${user.image}` : null} />
                                                <AvatarFallback>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar> */}
                                            <Avatar
                                                className="relative z-50 h-8 w-8 overflow-hidden"
                                                image={user.image}
                                                name={user.name}
                                                lastActivity={user.last_online || null}
                                                onlineCircleClass="hidden"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                            <Check className="h-4 w-4 text-green-500" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Username Suggestions */}
                            {showUsernameSuggestions && usernameSuggestions.length > 0 && (
                                <div
                                    ref={suggestionRef}
                                    className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                >
                                    {usernameSuggestions.map((user, index) => (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                handleSuggestionClick({
                                                    type: 'username',
                                                    value: user.name,
                                                    user: user,
                                                })
                                            }
                                            className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {/* <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image ? `/storage/${user.image}` : null} />
                                                <AvatarFallback>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar> */}
                                            <Avatar
                                                className="relative z-50 h-8 w-8 overflow-hidden"
                                                image={user.image}
                                                name={user.name}
                                                lastActivity={user.ast_online || null}
                                                onlineCircleClass="hidden"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1 text-sm font-medium">
                                                    <AtSign className="h-3 w-3" />
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                            <Check className="h-4 w-4 text-green-500" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Type email addresses or @usernames. Press Enter or comma to add.</p>
                        {errors.emails && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{Array.isArray(errors.emails) ? errors.emails.join(', ') : errors.emails}</span>
                            </div>
                        )}
                        {errors.project_id && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Project ID: {Array.isArray(errors.project_id) ? errors.project_id.join(', ') : errors.project_id}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Personal Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Add a personal message to the invitation email..."
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">This message will be included in the invitation email sent to recipients.</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || selectedItems.length === 0 || !projectId}
                            className="bg-[var(--color-alpha)] hover:bg-[var(--color-alpha)]/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                                    Sending Invitations...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send {selectedItems.length} Invitation{selectedItems.length !== 1 ? 's' : ''} via Email
                                </>
                            )}
                        </Button>
                        {!projectId && <p className="mt-1 text-xs text-red-600">Project ID is missing. Please close and try again.</p>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdvancedInviteModal;
