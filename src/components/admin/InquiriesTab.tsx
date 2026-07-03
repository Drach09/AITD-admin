import { useQuery } from "@tanstack/react-query";
import { getInquiries } from "@/lib/api";
import { Loader2, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function InquiriesTab() {
  const { data: inquiries, isLoading, isError, refetch } = useQuery({
    queryKey: ["inquiries"],
    queryFn: getInquiries,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <p className="text-red-500">Failed to load inquiries.</p>
        <button
          onClick={() => refetch()}
          className="rounded bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!inquiries?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inquiries</CardTitle>
          <CardDescription>No one has submitted a contact form yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Contact Inquiries
        </h2>
        <p className="text-muted-foreground">
          View messages submitted through the website's contact forms.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{inquiry.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                {format(new Date(inquiry.created_at), "MMM d, yyyy h:mm a")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex flex-col gap-1 text-sm">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-brand-primary dark:text-slate-300"
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.email}
                </a>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-brand-primary dark:text-slate-300"
                >
                  <Phone className="h-4 w-4" />
                  {inquiry.phone}
                </a>
              </div>
              
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {inquiry.message ? (
                  <p className="whitespace-pre-wrap">{inquiry.message}</p>
                ) : (
                  <p className="italic text-slate-400">No message provided.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
