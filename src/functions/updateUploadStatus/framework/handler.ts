import { APIGatewayProxyEvent, Context } from "aws-lambda";
import Response from '../../../common/application/api/Response';
import createResponse from "../../../common/application/utils/createResponse";
import { HttpStatus } from "../../../common/application/api/HttpStatus";


export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
    return createResponse({}, HttpStatus.CREATED);
}