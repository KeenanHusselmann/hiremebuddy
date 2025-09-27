import MobilePageLayout from '@/components/MobilePageLayout';
import HowItWorksContent from '@/components/HowItWorksContent';

const HowItWorksPage = () => {
  return (
    <MobilePageLayout title="How It Works" showBackButton={true}>
      <HowItWorksContent />
    </MobilePageLayout>
  );
};

export default HowItWorksPage;