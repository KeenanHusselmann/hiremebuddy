import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, CheckCircle, XCircle, User } from 'lucide-react';

interface PendingVerification {
  id: string;
  profile_id: string;
  full_name: string;
  contact_number: string;
  location_text: string;
  id_document_front_path: string;
  id_document_back_path: string;
  selfie_image_path: string;
  verification_status: string;
  verification_notes: string;
  created_at: string;
  user_type: string;
}

const AdminVerification = () => {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            contact_number,
            location_text,
            user_type
          )
        `)
        .eq('verification_status', 'pending')
        .in('profiles.user_type', ['labourer', 'both'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        profile_id: item.profile_id,
        full_name: item.profiles.full_name,
        contact_number: item.profiles.contact_number,
        location_text: item.profiles.location_text,
        user_type: item.profiles.user_type,
        id_document_front_path: item.id_document_front_path,
        id_document_back_path: item.id_document_back_path,
        selfie_image_path: item.selfie_image_path,
        verification_status: item.verification_status,
        verification_notes: item.verification_notes,
        created_at: item.created_at,
      })) || [];
      
      setVerifications(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load verifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationDecision = async (verificationId: string, status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('verification_documents')
        .update({
          verification_status: status,
          verification_notes: notes || null,
          verified_at: status === 'approved' ? new Date().toISOString() : null,
          verified_by: status === 'approved' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification ${status} successfully`,
      });

      // Remove from pending list
      setVerifications(prev => prev.filter(v => v.id !== verificationId));
      setSelectedVerification(null);
      setNotes('');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${status} verification`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading pending verifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">
            Review and approve service provider identity documents
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {verifications.length} Pending
        </Badge>
      </div>

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground text-center">
              No pending verifications at the moment. New submissions will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification List */}
          <div className="space-y-4">
            {verifications.map((verification) => (
              <Card 
                key={verification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedVerification?.id === verification.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedVerification(verification)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{verification.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4" />
                        {verification.user_type === 'labourer' ? 'Service Provider' : 'Both'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(verification.created_at)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Contact:</span> {verification.contact_number}</p>
                    <p><span className="font-medium">Location:</span> {verification.location_text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verification Details */}
          <div className="lg:sticky lg:top-6">
            {selectedVerification ? (
              <Card>
                <CardHeader>
                  <CardTitle>Review Documents</CardTitle>
                  <CardDescription>
                    Carefully review all documents for {selectedVerification.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Images */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        ID Document (Front)
                      </h4>
                      <div 
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageInNewTab(selectedVerification.id_document_front_path)}
                      >
                        <img 
                          src={selectedVerification.id_document_front_path}
                          alt="ID Front"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        ID Document (Back)
                      </h4>
                      <div 
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageInNewTab(selectedVerification.id_document_back_path)}
                      >
                        <img 
                          src={selectedVerification.id_document_back_path}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Selfie with ID
                      </h4>
                      <div 
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageInNewTab(selectedVerification.selfie_image_path)}
                      >
                        <img 
                          src={selectedVerification.selfie_image_path}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Admin Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this verification..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVerificationDecision(selectedVerification.id, 'approved')}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerificationDecision(selectedVerification.id, 'rejected')}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select Verification</h3>
                  <p className="text-muted-foreground text-center">
                    Choose a verification request from the list to review their documents
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;