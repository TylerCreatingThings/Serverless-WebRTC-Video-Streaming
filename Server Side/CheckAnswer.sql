USE [yokd_db]
GO

/****** Object:  StoredProcedure [dbo].[checkAnswer]    Script Date: 2022-02-19 7:11:10 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




































-- =============================================
-- Author:		Tyler Farkas
-- Create date: 2019-07-30
-- Description:	Checks and sets the Answer.
-- Updated With Token: 2019-08-09
-- =============================================
CREATE PROCEDURE [dbo].[checkAnswer]
	-- Add the parameters for the stored procedure here
	@token varchar(70),
	@answer varchar(max),
	@bookId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @accountId int
	declare @answerExist varchar(max)

	select @accountId=accountId from Account where accountToken=@token

	IF NULLIF(@accountId, '') IS NOT NULL
	BEGIN
			select @answerExist=answer from VirtualBooking where bookId=@bookId
			IF @answer != 'Waiting'
			BEGIN
				UPDATE VirtualBooking
				set answer=@answer
				where bookId=@bookId
				select 'Set Answer' as SetAnswer
			end
			ELSE
			begin
				if nullif(@answerExist,'') is null
				begin
				select 'Waiting' as SetAnswer
				end
				else
				select @answerExist as SetAnswer
			END
	END
	ELSE
			select 'Invalid Token, Please try again.'
	END

GO


