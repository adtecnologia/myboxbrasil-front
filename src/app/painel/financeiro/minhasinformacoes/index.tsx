// services
import { ProfileTypeEnum } from '@/enums/profile-type-enum';
import {  getProfileType} from '../../../../services';
import FinancialMinhaContaAdmin from './admin';
import FinancialMinhaContaComum from './comum';


const FinancialMinhaConta = () => {
  const profileType = getProfileType();

  if (profileType === ProfileTypeEnum.ADMIN) {
    return <FinancialMinhaContaAdmin />
  } else {
    return <FinancialMinhaContaComum />
  }
};

export default FinancialMinhaConta;
