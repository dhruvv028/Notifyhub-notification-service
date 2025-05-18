import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { Mail, MessageSquare, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendNotification, getUsers } from '../api/apiClient';
import { NotificationType } from '../types';

interface FormData {
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
}

const SendNotification = () => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'email',
      title: '',
      content: '',
    }
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery('users', getUsers);

  const mutation = useMutation(
    (data: FormData) => sendNotification(data.userId, data.type, data.title, data.content),
    {
      onSuccess: () => {
        toast.success('Notification sent successfully!');
        reset();
      },
      onError: () => {
        toast.error('Failed to send notification. Please try again.');
      },
    }
  );

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Send Notification</h1>
        <p className="mt-2 text-gray-600">
          Create and send notifications to your users through multiple channels.
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <select
              id="userId"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('userId', { required: 'Please select a recipient' })}
            >
              <option value="">Select a user</option>
              {isLoadingUsers ? (
                <option disabled>Loading users...</option>
              ) : (
                users?.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))
              )}
            </select>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Please select a type' }}
                render={({ field }) => (
                  <>
                    <label className={`relative flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      field.value === 'email' 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        className="sr-only"
                        value="email"
                        checked={field.value === 'email'}
                        onChange={() => field.onChange('email')}
                      />
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          field.value === 'email' 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Email</div>
                        </div>
                      </div>
                    </label>

                    <label className={`relative flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      field.value === 'sms' 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        className="sr-only"
                        value="sms"
                        checked={field.value === 'sms'}
                        onChange={() => field.onChange('sms')}
                      />
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          field.value === 'sms' 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">SMS</div>
                        </div>
                      </div>
                    </label>

                    <label className={`relative flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      field.value === 'in_app' 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        className="sr-only"
                        value="in_app"
                        checked={field.value === 'in_app'}
                        onChange={() => field.onChange('in_app')}
                      />
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          field.value === 'in_app' 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <BellRing className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">In-App</div>
                        </div>
                      </div>
                    </label>
                  </>
                )}
              />
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Notification Title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              rows={4}
              className={`block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Notification content..."
              {...register('content', { 
                required: 'Content is required',
                minLength: { value: 10, message: 'Content should be at least 10 characters' }
              })}
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                mutation.isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {mutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;