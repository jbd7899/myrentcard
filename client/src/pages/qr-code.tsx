import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const QRCodePage = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const pageId = location.split('/').pop() || '';
  const isGeneral = pageId === 'general';
  
  const screeningUrl = isGeneral
    ? `${window.location.origin}/screening/general`
    : `${window.location.origin}/screening/property/${pageId.replace('property-', '')}`;

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({
        title: 'Error',
        description: 'Could not generate QR code image',
        variant: 'destructive',
      });
      return;
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `screening-qr-${pageId}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isGeneral ? 'General Screening QR Code' : 'Property Screening QR Code'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <QRCodeSVG
              value={screeningUrl}
              size={256}
              level="H"
              includeMargin
            />
          </div>
          <div className="text-center text-sm text-gray-600 break-all">
            {screeningUrl}
          </div>
          <Button 
            onClick={downloadQRCode}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
