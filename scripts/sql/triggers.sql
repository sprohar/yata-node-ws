CREATE OR REPLACE FUNCTION init_user_fn()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
BEGIN
  UPDATE public.users
  SET preferences = '{"isDarkTheme":true,"defaultDueDateToday":true,"taskView":0}'::jsonb
  WHERE user_id = NEW.user_id;

	INSERT INTO public.projects(name, user_id)
		 VALUES ('Inbox', NEW.user_id), 
            ('Work', NEW.user_id), 
            ('Personal', NEW.user_id), 
            ('Shopping List', NEW.user_id);

	RETURN NEW;
END;
$$
;

DROP TRIGGER IF EXISTS init_user_trigger ON public.users;

CREATE TRIGGER init_user_trigger 
  AFTER INSERT
  ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE init_user_fn();
