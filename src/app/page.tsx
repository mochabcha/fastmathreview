import { AssessmentSession } from '@/components/organisms/AssessmentSession/AssessmentSession';
import { AssessmentPageTemplate } from '@/components/templates/AssessmentPageTemplate/AssessmentPageTemplate';
import { getGrade4AssessmentPageModel } from '@/lib/pages/getGrade4AssessmentPageModel';

export default function Page() {
  const pageModel = getGrade4AssessmentPageModel();

  return (
    <AssessmentPageTemplate
      session={
        <AssessmentSession
          assessment={pageModel.assessment}
          standards={pageModel.standards}
          references={pageModel.references}
        />
      }
    />
  );
}
